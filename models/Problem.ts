import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProblem extends Document {
  title: string;
  problemId: number; // The leetcode ID e.g. 11
  url: string;
  section: string; // e.g. "I. Two Pointer Patterns"
  pattern: string; // e.g. "Pattern 1: Converging"
  slug: string;
  difficulty?: string; // We might not have this from excel, but good to have
}

const ProblemSchema: Schema = new Schema({
  title: { type: String, required: true },
  problemId: { type: Number, required: true },
  url: { type: String, required: true },
  section: { type: String, required: true },
  pattern: { type: String, required: true },
  slug: { type: String, required: true },
  difficulty: { type: String, default: 'Medium' }, // Defaulting since we don't have it
});

// Prevent over-compilation error
const Problem: Model<IProblem> = mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema);

export default Problem;
