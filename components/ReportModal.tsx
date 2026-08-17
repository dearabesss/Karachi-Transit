"use client";

import React, { useState } from "react";
import { TRANSIT_ROUTES, DelayReport } from "@/data/transitData";
import { AlertTriangle, X } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (report: DelayReport) => void;
  initialStopName?: string;
  initialRouteId?: string;
  isUrdu?: boolean;
}

export default function ReportModal({
  isOpen,
  onClose,
  onSuccess,
  initialStopName = "",
  initialRouteId = TRANSIT_ROUTES[0].id,
  isUrdu = false,
}: ReportModalProps) {
  const [routeId, setRouteId] = useState(initialRouteId);
  const [stopName, setStopName] = useState(initialStopName);
  const [issueType, setIssueType] = useState<DelayReport["issueType"]>("Delay");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const targetRoute = TRANSIT_ROUTES.find((r) => r.id === routeId);

    const payload = {
      routeId,
      routeName: targetRoute ? targetRoute.name : "Karachi Bus",
      stopName: stopName.trim() || (targetRoute ? targetRoute.stops[0].name : "Station"),
      issueType,
      comment: comment.trim(),
    };

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.report) {
        onSuccess(data.report);
      }
    } catch {
      onSuccess({
        id: `rep-${Date.now()}`,
        routeId: payload.routeId,
        routeName: payload.routeName,
        stopName: payload.stopName,
        issueType: payload.issueType,
        comment: payload.comment || "Reported delay.",
        timestamp: "Just now",
      });
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-[3000] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-300 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            {isUrdu ? "بس تاخیر کی اطلاع دیں" : "Report Bus Delay or Issue"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isUrdu ? "بس سروس منتخب کریں" : "Select Route"}
            </label>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-slate-900"
            >
              {TRANSIT_ROUTES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.service} — {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isUrdu ? "اسٹاپ کا نام / مقام" : "Stop / Landmark"}
            </label>
            <input
              type="text"
              required
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              placeholder="e.g. Numaish, Karsaz"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isUrdu ? "مسئلے کی قسم" : "Issue Type"}
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as DelayReport["issueType"])}
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-slate-900"
            >
              <option value="Delay">{isUrdu ? "شدید تاخیر" : "Severe Delay"}</option>
              <option value="Heavy Traffic">{isUrdu ? "ٹریفک جام" : "Heavy Traffic Jam"}</option>
              <option value="Overcrowded">{isUrdu ? "بس میں رش" : "Bus Overcrowded (Full)"}</option>
              <option value="Bus Broken Down">{isUrdu ? "بس خراب ہے" : "Bus Broken Down"}</option>
              <option value="Station Issue">{isUrdu ? "اسٹیشن پر مسئلہ" : "Station Ticketing Down"}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isUrdu ? "تفصیلات (اختیاری)" : "Details (Optional)"}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isUrdu ? "یہاں تفصیل لکھیں..." : "Provide any extra details here..."}
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-900 text-base font-bold py-4 rounded-lg hover:bg-slate-200 transition-colors"
            >
              {isUrdu ? "منسوخ" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-slate-900 text-white text-base font-bold py-4 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (isUrdu ? "رپورٹ بھیجی جا رہی ہے..." : "Submitting...") : isUrdu ? "رپورٹ جمع کریں" : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
