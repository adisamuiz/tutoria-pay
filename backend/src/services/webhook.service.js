import { fetchInvoice, updateInvoice, updatewallet, fetchVirtualAccount, addWallet, fetchPayment, fetchWallet, addPayment } from "../models/payment.model.js";

let paymentRef = null

const reconcilePayment = async (payloadData) => {
    try {
        const { eventData, eventType } = payloadData;
        const { transactionReference, amountPaid, product } = eventData // destructure incoming webhook data
        // Check for duplicate payment
        const paymentRes = await fetchPayment(transactionReference);
        if (paymentRes) {
            return;
        }

        // Fetch existing virtual account data
        const virtualAccountRes = await fetchVirtualAccount(product.reference);
        if (!virtualAccountRes) {
            throw new Error('Anonymous payment detected');
        };

        // Fetch existing invoice
        const studentId = virtualAccountRes.student_id;
        const invoiceRes = await fetchInvoice(studentId);
        if (!invoiceRes) {
            await handleOverpayment(studentId, amountPaid)
            return;
        }

        // Update payment log
        await addPayment(invoiceRes.id, amountPaid, transactionReference, payloadData)
        paymentRef = transactionReference

        // Handle reconciliation logic
        const totalPaid = Number(invoiceRes.amount_paid) + Number(amountPaid);
        let amountLeft = invoiceRes.expected_amount

        // Handle full payment and overpayment
        if (Number(totalPaid) >= Number(invoiceRes.expected_amount)){
            amountLeft = 0;
            const newTotalPaid = 0
            const status = 'paid'
            const balance = Number(totalPaid) - Number(invoiceRes.expected_amount)
            await updateInvoice(newTotalPaid, status, amountLeft, product.reference);
            await handleOverpayment (studentId, balance)
            return;
        }

        // Handle underpayment
        amountLeft = Number(invoiceRes.expected_amount) - Number(totalPaid);
        const status = 'partially_paid'
        await updateInvoice(totalPaid, status, amountLeft, product.reference);
    } 
    catch (error) {
        console.error(error.response?.data || error.message);
    }

}

const handleOverpayment = async (studentId, transactionBalance) => {
    try{
        const walletRes = await fetchWallet(studentId);  // Fetch existing wallet
        if (!walletRes) {
            await addWallet(studentId, transactionBalance);  // Create new wallet if none exists
            return;
        }
        //console.log(walletRes)
        const newBalance = Number(walletRes.balance) + Number(transactionBalance)  // Calculate new wallet balance
        await updatewallet(newBalance, studentId);  // Update wallet with new balance
    } catch (error) {
        console.error(error.response?.data || error.message);
    }
}

const fetchPaymentStatus = async () => {
    try {
        const paymentRes = await fetchPayment(paymentRef); // fetch all the payment details
        //console.log(paymentRes)
        if (paymentRes) {
            const paymentData = paymentRes.raw_webhook_payload.eventData;
            paymentRef = null;
            return (
                {
                    eventType: paymentRes.raw_webhook_payload.eventType,
                    transactionReference: paymentData.transactionReference.split('|').at(-1),
                    paymentDate: paymentData.paidOn,
                    paymentMethod: paymentData.paymentMethod,
                    amountPaid: paymentData.amountPaid,
                }
            );
        }
    } catch (error) {
        console.error(error.response?.data || error.message)
    }
}
export {reconcilePayment, fetchPaymentStatus}