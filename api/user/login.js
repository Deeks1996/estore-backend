import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/express';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const userLogin = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier and password required' });
  }

  try {
    // Find the user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }]
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Compare password with hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify the user exists in Clerk (optional, depending on your integration)
    const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [user.email] });

    if (!clerkUsers || clerkUsers.length === 0) {
      return res.status(400).json({ error: 'User not found in Clerk' });
    }

    const clerkUser = clerkUsers[0];

    // Generate JWT or use Clerk's API to generate a session token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET_KEY, 
      { expiresIn: '1h' } 
    );

    // Return success response with token
    res.status(200).json({
      message: 'Login successful',
      user,
      token, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'User login failed' });
  }
};

export default userLogin;
