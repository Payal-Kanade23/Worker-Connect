export const hasPermission = (
  permissions: readonly string[] | null | undefined,
  permission: string | null | undefined,
) => {
  // A route/action with no permission is public.
  if (!permission) return true;
   console.log("truejbjsjh",permissions?.includes(permission))
  // Fail closed when auth state is not available or is malformed.
  return Array.isArray(permissions) && permissions.includes(permission);
};

