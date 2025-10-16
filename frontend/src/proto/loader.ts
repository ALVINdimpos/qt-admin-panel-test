import protobuf from "protobufjs";

let rootPromise: Promise<protobuf.Root> | null = null;

export function getProtoRoot() {
  if (!rootPromise) {
    // Load from public directory
    rootPromise = protobuf.load("/user.proto");
  }
  return rootPromise;
}

export async function getTypes() {
  const root = await getProtoRoot();
  const UserList = root.lookupType("qt.UserList");
  const User = root.lookupType("qt.User");
  return { UserList, User };
}
