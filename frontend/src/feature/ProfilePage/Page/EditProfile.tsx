import React from "react";
import { useAuth } from "../../../context/authContext";
import CustomerProfileForm from "./CustomerProfileForm";
import WorkerProfileForm from "./WorkerProfileForm";

const EditProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading...</p>;
  }

  if (user.role === "worker") {
    return <WorkerProfileForm user={user} />;
  }

  if (user.role === "customer") {
    return <CustomerProfileForm user={user} />;
  }

  return <p>Invalid user role</p>;
};

export default EditProfile;