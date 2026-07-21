import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

import {
  CheckCircle2,
  Loader2,
  Receipt,
  BookOpen,
  CalendarDays,
  CreditCard,
  Hash,
  ArrowRight,
} from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { paymentId } = useParams();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  async function loadPayment() {
    setLoading(true);

    try {
      const res = await api.get(`/payments/me/status`);
      console.log(res)
      setPayment(res.data);

    } catch (error) {

      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load payment information."
      );

    } finally {

      setLoading(false);

    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2
          size={42}
          className="animate-spin text-emerald-600"
        />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">

        <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl text-center">

          <Receipt
            size={60}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-6 text-3xl font-bold">

            Payment Not Found

          </h2>

          <p className="mt-3 text-slate-500">

            {message ||
              "We couldn't find this payment."}

          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-8 rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }

    return (

    <div className="min-h-screen bg-slate-100">

      <div className="mx-auto max-w-5xl px-6 py-12">

        <div className="rounded-3xl bg-white p-10 shadow-xl">

          {/* Success Header */}

          <div className="flex flex-col items-center text-center">

            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100">

              <CheckCircle2
                size={70}
                className="text-emerald-600"
              />

            </div>

            <h1 className="mt-8 text-4xl font-bold text-slate-900">

              Payment Successful

            </h1>

          </div>

          {/* Payment Details */}

          <div className="mt-12 space-y-6 min-w-screen lg:flex-row lg:items-center lg:justify-between">

            {/* Left */}

            <div className="rounded-2xl border bg-slate-50 p-8">

              <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">

                <Receipt />

                Payment Details

              </h2>

              <div className="space-y-6">

                <div className="flex items-center justify-between">

                  <span className="text-slate-500">

                    Invoice Number

                  </span>

                  <span className="font-semibold">

                    {/* {payment.invoice_no} */}

                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-slate-500">

                    Transaction Reference

                  </span>

                  <span className="font-semibold">

                    {payment.transactionReference}

                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-slate-500">

                    Status

                  </span>

                  <span className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">

                    PAID

                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-slate-500">

                    Currency

                  </span>

                  <span className="font-semibold">

                    {/* {payment.currency} */}

                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-slate-500">

                    Amount Paid

                  </span>

                  <span className="text-2xl font-bold text-emerald-600">

                    ₦{Number(payment.amountPaid).toLocaleString()}

                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-slate-500">

                    Payment Date

                  </span>

                  <span className="font-semibold">

                    {new Date(payment.paymentDate).toLocaleString()}

                  </span>

                </div>

              </div>

            </div>

          </div>

                    {/* Action Buttons */}

          <div className="mt-12 flex flex-col gap-4 md:flex-row md:justify-center">

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 font-semibold text-white transition hover:bg-emerald-700"
            >
              Go to Dashboard
              <ArrowRight size={20} />
            </button>

            <button
              onClick={() => window.print()}
              className="rounded-xl border border-slate-300 px-8 py-4 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Download Receipt
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}