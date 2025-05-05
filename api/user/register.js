import { clerkClient } from '@clerk/express';
import bcrypt from 'bcryptjs'; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const registerUser = async (req, res) => {
  const { name, email, password, username, role } = req.body; // role is passed in the request body

  if (!name || !email || !password || !username) {
    return res.status(400).json({ error: 'Name, email, password, and username are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in Clerk with role defined dynamically (either 'user' or 'admin')
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password: password,
      username,
      firstName: name,
      publicMetadata: { role: role || 'user' }, 
    });

    if (!clerkUser) {
      return res.status(500).json({ error: 'Failed to create user in Clerk' });
    }

    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress || email;
    const primaryUsername = clerkUser.username || username;

    // Store the user data in Prisma with hashed password
    const user = await prisma.user.create({
      data: {
        name: name,
        email: primaryEmail,
        username: primaryUsername,
        password: hashedPassword,
        role: role?.toUpperCase() || 'USER',
      },
    });
    

    res.status(200).json({ user, clerkUser });

  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: 'User registration failed' });
  }
};

export default registerUser;