"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertAdminSession } from "@/lib/admin-auth";

export async function setupInitialAdmin(email, password, secret) {
  if (secret !== process.env.SETUP_SECRET) {
    return { success: false, error: "Invalid setup secret" };
  }

  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: "Super Admin",
      },
    });

    if (res.user) {
      await prisma.user.update({
        where: { id: res.user.id },
        data: { role: "superadmin", permissions: JSON.stringify(["all"]) },
      });
      return { success: true };
    }

    return { success: false, error: "Failed to create admin" };
  } catch (error) {
    console.error("Setup error:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdmins() {
  await assertAdminSession();
  const admins = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return admins.map((a) => ({
    ...a,
    permissions: a.permissions ? JSON.parse(a.permissions) : [],
  }));
}

export async function createAdmin(data) {
  try {
    await assertAdminSession();
    const res = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });

    if (res.user) {
      await prisma.user.update({
        where: { id: res.user.id },
        data: {
          role: data.role,
          permissions: JSON.stringify(data.permissions),
        },
      });
      return { success: true };
    }

    return { success: false, error: "Failed to create admin" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateAdmin(id, data) {
  try {
    await assertAdminSession();
    const updateData = {
      name: data.name,
      role: data.role,
      permissions: JSON.stringify(data.permissions),
    };

    if (data.email) {
      updateData.email = data.email;
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteAdmin(id) {
  try {
    await assertAdminSession();
    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
