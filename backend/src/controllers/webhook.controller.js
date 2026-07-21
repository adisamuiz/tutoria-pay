import config from '../config/env.config.js';
import {sha512} from 'js-sha512';
import { reconcilePayment } from '../services/webhook.service.js';

const verifyAndReceiveWebhook = async (req, res) => {
    try {
        const monnifySignature = req.headers['monnify-signature'];  // Grab signature header from incoming payload
        if (!monnifySignature) {
            return res.status(401).json({ message: 'Missing signature' });
        }

        // Handle incoming payload verification
        const payloadString = JSON.stringify(req.body);
        //console.log(req.body)
        const expectedSignature = sha512.hmac(config.MONIFY_SECRET_KEY, payloadString) // hash incoming payload
        // console.log('expectedHash:', expectedSignature)
        // console.log('receivedHash:', monnifySignature)
        if (expectedSignature !== monnifySignature) {
            console.log('Bad signature')
            return res.status(401).json({ message: 'Unauthorized payload' });
        }

        const { eventType, eventData } = req.body  // destructur request body

        //  Handle failed payment
        if (eventType == 'payment_failed') {
            return res.status(200).json({ eventType })        
        }

        // Handle payment success event
        if (eventType == 'SUCCESSFUL_TRANSACTION') {
            await reconcilePayment(req.body)
        }

        // Handle payment reversal
        if (eventType == 'payment_reversal') {
            return res.status(200).json({ eventType })
        }

        // else {
        //     throw new Error('Invalid webhook');
        // }

        console.log('Webhook processed successfully')
        res.status(200).json({ eventType });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Could not resolve webhook', error: error.message });
    }
};
export { verifyAndReceiveWebhook }