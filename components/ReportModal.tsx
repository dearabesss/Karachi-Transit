"use client";

import React, { useState } from "react";
import { TRANSIT_ROUTES, DelayReport } from "@/data/transitData";
import { AlertTriangle, X, Send } from "lucide-react";

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
    <div className="fixed inset-0 bg-slate-900/60 z-[3000] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            {isUrdu ? "بس تاخیر یا مسئلے کی اطلاع دیں" : "Report Bus Delay or Issue"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? "بس سروس منتخب کریں" : "Select Route"}
            </label>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {TRANSIT_ROUTES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.service} — {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? "اسٹاپ کا نام / مقام" : "Stop / Landmark"}
            </label>
            <input
              type="text"
              required
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              placeholder="e.g. Numaish, Karsaz, Safoora Chowrangi"
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? "مسئلے کی قسم" : "Issue Type"}
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as DelayReport["issueType"])}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="Delay">{isUrdu ? "شدید تاخیر" : "Severe Delay"}</option>
              <option value="Heavy Traffic">{isUrdu ? "ٹریفک جام" : "Heavy Traffic Jam"}</option>
              <option value="Overcrowded">{isUrdu ? "بس میں رش" : "Bus Overcrowded (Full)"}</option>
              <option value="Bus Broken Down">{isUrdu ? "بس خراب ہے" : "Bus Broken Down"}</option>
              <option value="Station Issue">{isUrdu ? "اسٹیشن پر مسئلہ" : "Station Ticketing Down"}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? "تفصیلات (اختیاری)" : "Details (Optional)"}
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isUrdu ? "مثال: بس ۲۰ منٹ سے نہیں آئی..." : "e.g. 20 min headway delay, road diversion..."}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 text-xs py-2 rounded font-medium hover:bg-slate-200"
            >
              {isUrdu ? "منسوخ" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-slate-900 text-white text-xs py-2 rounded font-medium hover:bg-slate-800 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              {isSubmitting ? (isUrdu ? "ارسال ہو رہا ہے..." : "Submitting...") : isUrdu ? "رپورٹ بھیجیں" : "Submit Alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
