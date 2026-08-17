import { NextResponse } from "next/server";
import { INITIAL_REPORTS, DelayReport } from "@/data/transitData";
import { createClient } from "@supabase/supabase-js";

let memoryReports: DelayReport[] = [...INITIAL_REPORTS];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function GET() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        const formatted: DelayReport[] = data.map((item: any) => ({
          id: item.id.toString(),
          routeId: item.route_id,
          routeName: item.route_name,
          stopName: item.stop_name,
          issueType: item.issue_type,
          comment: item.comment,
          timestamp: "Recently",
        }));
        return NextResponse.json({ reports: formatted });
      }
    } catch {
      // Fallback to memory store
    }
  }
  return NextResponse.json({ reports: memoryReports });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { routeId, routeName, stopName, issueType, comment } = body;

    if (!routeId || !stopName || !issueType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newReport: DelayReport = {
      id: `rep-${Date.now()}`,
      routeId,
      routeName,
      stopName,
      issueType,
      comment: comment || "Reported by commuter.",
      timestamp: "Just now",
    };

    if (supabase) {
      try {
        await supabase.from("reports").insert([
          {
            route_id: routeId,
            route_name: routeName,
            stop_name: stopName,
            issue_type: issueType,
            comment: comment || "Reported by commuter.",
          },
        ]);
      } catch {
        // Fallback to memory store
      }
    }

    memoryReports = [newReport, ...memoryReports];
    return NextResponse.json({ success: true, report: newReport }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 500 });
  }
}
