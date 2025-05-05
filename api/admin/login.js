import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/express';  

const prisma = new PrismaClient();

const adminLogin = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify user in Clerk
    const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [user.email] });

    if (!clerkUsers || clerkUsers.length === 0) {
      return res.status(400).json({ error: 'User not found in Clerk' });
    }

    const clerkUser = clerkUsers[0];
    
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Admin login failed' });
  }
};

export default adminLogin;
