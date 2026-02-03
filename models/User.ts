import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    name?: string;
    completedProblems: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Store hashed
    name: { type: String },
    completedProblems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
