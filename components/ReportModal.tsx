"use client";

import React, { useState, useEffect } from "react";
import { TransitRoute, DelayReport } from "@/data/transitData";
import { AlertTriangle, X } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (report: DelayReport) => void;
  activeRoutes: TransitRoute[];
  initialStopName?: string;
  isUrdu?: boolean;
}

export default function ReportModal({
  isOpen,
  onClose,
  onSuccess,
  activeRoutes,
  initialStopName = "",
  isUrdu = false,
}: ReportModalProps) {
  const [routeId, setRouteId] = useState("");
  const [stopName, setStopName] = useState(initialStopName);
  const [issueType, setIssueType] = useState<DelayReport["issueType"]>("Delay");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && activeRoutes.length > 0 && !routeId) {
      setRouteId(activeRoutes[0].id);
    }
  }, [isOpen, activeRoutes, routeId]);

  useEffect(() => {
    if (initialStopName) setStopName(initialStopName);
  }, [initialStopName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const targetRoute = activeRoutes.find((r) => r.id === routeId);

    const payload = {
      routeId,
      routeName: targetRoute ? targetRoute.name : "Transit Bus",
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
      <div className="bg-white border-2 border-slate-300 rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            {isUrdu ? "مسئلے کی اطلاع" : "Report Issue"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {isUrdu ? "روٹ" : "Select Route"}
            </label>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-base focus:border-slate-900 bg-white"
            >
              {activeRoutes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.service} — {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {isUrdu ? "اسٹاپ" : "Stop / Landmark"}
            </label>
            <input
              type="text"
              required
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              placeholder="e.g. Numaish"
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-base focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {isUrdu ? "مسئلہ" : "Issue Type"}
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as DelayReport["issueType"])}
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-base focus:border-slate-900 bg-white"
            >
              <option value="Delay">{isUrdu ? "تاخیر" : "Severe Delay"}</option>
              <option value="Heavy Traffic">{isUrdu ? "ٹریفک" : "Heavy Traffic Jam"}</option>
              <option value="Overcrowded">{isUrdu ? "رش" : "Bus Overcrowded"}</option>
              <option value="Bus Broken Down">{isUrdu ? "خراب" : "Bus Broken Down"}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {isUrdu ? "تفصیل" : "Details (Optional)"}
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-base focus:border-slate-900"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-900 text-base font-bold py-3.5 rounded-lg">
              {isUrdu ? "منسوخ" : "Cancel"}
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-slate-900 text-white text-base font-bold py-3.5 rounded-lg disabled:opacity-50">
              {isUrdu ? "جمع کریں" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
