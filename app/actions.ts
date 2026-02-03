"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function toggleProblem(problemId: string, isCompleted: boolean) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false };

    await dbConnect();

    try {
        if (isCompleted) {
            await User.findOneAndUpdate(
                { email: session.user.email },
                { $addToSet: { completedProblems: problemId } }
            );
        } else {
            await User.findOneAndUpdate(
                { email: session.user.email },
                { $pull: { completedProblems: problemId } }
            );
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Toggle Error", error);
        return { success: false };
    }
}
