import dbConnect from "@/lib/db";
import Problem from "@/models/Problem";
import User from "@/models/User";

export interface SheetData {
    title: string;
    patterns: {
        title: string;
        problems: any[];
    }[];
}

/**
 * Fetches the complete sheet data, including user-specific progress (completion, stars, notes).
 * Uses lean() for performance and manual ID string conversion for reliable frontend matching.
 */
export async function getSheetData(userId: string, sheetName: string): Promise<any[]> {
    try {
        await dbConnect();

        // Fetch all problems for this sheet
        const problems = await Problem.find({ sheet: sheetName }).sort({ orderIndex: 1 }).lean();

        // Fetch user progress
        const user = await User.findById(userId).lean();

        // Convert ObjectIds to strings for stable matching
        const userCompleted = (user?.completedProblems || []).map((id: any) => id.toString());
        const userSaved = (user?.savedProblems || []).map((id: any) => id.toString());
        const userNotes = user?.problemNotes || {};

        const sections: any = {};

        problems.forEach((p: any) => {
            const secTitle = p.section || "General";
            const patTitle = p.pattern || "General";

            if (!sections[secTitle]) {
                sections[secTitle] = { title: secTitle, patterns: {} };
            }
            if (!sections[secTitle].patterns[patTitle]) {
                sections[secTitle].patterns[patTitle] = { title: patTitle, problems: [] };
            }

            const pIdStr = p._id.toString();
            sections[secTitle].patterns[patTitle].problems.push({
                _id: pIdStr,
                id: p.problemId,
                title: p.title,
                url: p.url,
                yt_url: p.yt_url,
                difficulty: p.difficulty,
                isCompleted: userCompleted.includes(pIdStr),
                isSaved: userSaved.includes(pIdStr),
                note: userNotes instanceof Map ? userNotes.get(pIdStr) : userNotes[pIdStr] || ""
            });
        });

        // Convert nested objects to arrays for the frontend
        return Object.values(sections).map((sec: any) => ({
            ...sec,
            patterns: Object.values(sec.patterns)
        }));
    } catch (error) {
        console.error(`[DB_FETCH_ERROR] Failed to fetch data for ${sheetName}:`, error);
        return [];
    }
}
