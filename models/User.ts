import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    name?: string;
    completedProblems: mongoose.Types.ObjectId[];
    savedProblems: mongoose.Types.ObjectId[];
    problemNotes: { [problemId: string]: string };
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    name: { type: String },
    completedProblems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    savedProblems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    problemNotes: { type: Map, of: String, default: {} },
}, {
    timestamps: true,
    // Explicitly allow fields not mentioned to be saved, and ensure indexes are correct
    strict: true
});

// Robust model initialization for Next.js (Prevents OverwriteModelError)
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
