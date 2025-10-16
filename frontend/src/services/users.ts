import { getTypes } from "@/proto/loader";
import { sha384 } from "@/crypto/hash";
import { verifySignature } from "@/crypto/verify";
import { http } from "./http";

export type UserRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  emailHash: Uint8Array;
  signature: Uint8Array;
  publicKey: Uint8Array;
};

export async function fetchUsersProtobuf(): Promise<UserRow[]> {
  const res = await http("/api/users/export");
  const buf = new Uint8Array(await res.arrayBuffer());
  const { UserList } = await getTypes();
  const decoded = UserList.decode(buf) as { users?: Array<{ id: string; email: string; role: string; status: string; createdAt: string; emailHash: Uint8Array; signature: Uint8Array; publicKey: Uint8Array }> };
  const users = decoded.users ?? [];
  
  // Ensure bytes are Uint8Array
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    emailHash: new Uint8Array(u.emailHash),
    signature: new Uint8Array(u.signature),
    publicKey: new Uint8Array(u.publicKey),
  }));
}

/** Returns only users with a valid signature (requirement). */
export async function fetchVerifiedUsers(): Promise<UserRow[]> {
  const users = await fetchUsersProtobuf();
  const out: UserRow[] = [];
  
  for (const u of users) {
    try {
      const digest = await sha384(u.email);
      const isValid = await verifySignature(u.signature, digest, u.publicKey);
      if (isValid) {
        out.push(u);
      } else {
        console.warn(`Invalid signature for user ${u.email}`);
      }
    } catch (error) {
      console.error(`Failed to verify user ${u.email}:`, error);
    }
  }
  
  return out;
}

// CRUD Operations
export type CreateUserData = {
  email: string;
  role: string;
  status: string;
};

export type UpdateUserData = {
  email?: string;
  role?: string;
  status?: string;
};

export async function createUser(data: CreateUserData): Promise<UserRow> {
  const res = await http("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<UserRow> {
  const res = await http(`/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUser(userId: string): Promise<void> {
  await http(`/api/users/${userId}`, {
    method: "DELETE",
  });
}

export async function getUserById(userId: string): Promise<UserRow> {
  const res = await http(`/api/users/${userId}`);
  return res.json();
}
