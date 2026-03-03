"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

/**
 * Toggles the completion status of a problem for the current user.
 */
export async function toggleProblem(problemId: string, isCompleted: boolean) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return { success: false };

    await dbConnect();
    try {
        const update = isCompleted
            ? { $addToSet: { completedProblems: new mongoose.Types.ObjectId(problemId) } }
            : { $pull: { completedProblems: new mongoose.Types.ObjectId(problemId) } };

        await User.findByIdAndUpdate(session.user.id, update);

        revalidatePath("/a2z-sheet");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("[ACTION_ERROR] Toggle Problem failed:", error);
        return { success: false };
    }
}

/**
 * Toggles the revision (star) status of a problem for the current user.
 */
export async function toggleSaveProblem(problemId: string, isSaved: boolean) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return { success: false };

    await dbConnect();
    try {
        const pId = new mongoose.Types.ObjectId(problemId);
        const update = isSaved
            ? { $addToSet: { savedProblems: pId } }
            : { $pull: { savedProblems: pId } };

        // Use updateOne for maximum reliability
        await User.updateOne({ _id: session.user.id }, update);

        revalidatePath("/a2z-sheet");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("[ACTION_ERROR] Toggle Revision failed:", error);
        return { success: false };
    }
}

/**
 * Updates a personal note for a specific problem.
 */
export async function updateProblemNote(problemId: string, note: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return { success: false };

    await dbConnect();
    try {
        const updateObj = { [`problemNotes.${problemId}`]: note };
        await User.findByIdAndUpdate(session.user.id, { $set: updateObj });

        revalidatePath("/a2z-sheet");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("[ACTION_ERROR] Update Note failed:", error);
        return { success: false };
    }
}
