
import { clerkClient } from '@clerk/clerk-sdk-node';

export const getClerkUserId = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');

  try {
    const session = await clerkClient.sessions.verifySession(token);
    return session.userId;
  } catch (err) {
    console.error('Clerk verification failed:', err);
    return null;
  }
};
