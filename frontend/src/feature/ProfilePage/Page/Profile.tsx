import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Star,
  CalendarDays,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import {  useNavigate } from "react-router-dom";
import type { CurrentUser } from "../../../context/authContext";


interface ProfileProps {
  user: CurrentUser;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  
  const navigate = useNavigate()
  const isWorker = user.role === "worker";
  console.log(isWorker)

  const formatEmploymentType = (value?: string|undefined|null) => {
    if (!value) return "Not specified";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatTime = (time?: string) => {
    if (!time) return "Not specified";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: string | undefined) => {
    return new Date(date!).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
<button onClick={()=>{
  navigate(-1)
}}>
  ← Back
</button>
        {/* ================= PROFILE HEADER ================= */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">

          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

          <div className="px-6 pb-6">

            <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

              {/* Profile Info */}
              <div className="flex items-end gap-4">

                {/* Profile Image */}
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-md">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-gray-500" />
                  )}
                </div>

                <div className="flex items-center gap-3">
  <button
    onClick={() => navigate("/profile/edit")}
    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
  >
    Edit Profile
  </button>
</div>

                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h1>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold capitalize text-purple-700">
                      {user.role}
                    </span>

                    {user.is_active && (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Worker Rating */}
              {isWorker && (
                <div className="flex items-center gap-3 rounded-xl bg-yellow-50 px-5 py-3">

                  <Star className="h-7 w-7 fill-yellow-400 text-yellow-400" />

                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {user.rating_avg ?? "0.0"}
                    </p>

                    
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= COMMON INFORMATION ================= */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <User className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h2>

              <p className="text-sm text-gray-500">
                Your basic account information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <InfoItem
              icon={<User />}
              label="Full Name"
              value={user.name}
            />

            <InfoItem
              icon={<Mail />}
              label="Email"
              value={user.email}
            />

            <InfoItem
              icon={<Phone />}
              label="Phone"
              value={user.phone ?? "Not provided"}
            />

            <InfoItem
              icon={<ShieldCheck />}
              label="Account Type"
              value={formatEmploymentType(user.role)}
            />

            <InfoItem
              icon={<CalendarDays />}
              label="Member Since"
              value={formatDate(user.created_at)}
            />

            <InfoItem
              icon={<ShieldCheck />}
              label="Authentication"
              value={formatEmploymentType(user.auth_provider)}
            />

          </div>
        </section>

        {/* ================= WORKER INFORMATION ================= */}
        {isWorker && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Professional Information
                </h2>

                <p className="text-sm text-gray-500">
                  Your work and service details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                icon={<Briefcase />}
                label="Employment Type"
                value={formatEmploymentType(user.employment_type)}
              />

              <InfoItem
                icon={<IndianRupee />}
                label="Hourly Rate"
                value={
                  user.hourly_rate != null
                    ? `₹${user.hourly_rate}/hour`
                    : "Not specified"
                }
              />

              <InfoItem
                icon={<Clock />}
                label="Working Hours / Day"
                value={
                  user.hour_per_day != null
                    ? `${user.hour_per_day} hours`
                    : "Not specified"
                }
              />

              <InfoItem
                icon={<Clock />}
                label="Available From"
                value={formatTime(user.available_from)}
              />

              <InfoItem
                icon={<Clock />}
                label="Available Until"
                value={formatTime(user.available_to)}
              />

              <InfoItem
                icon={<Navigation />}
                label="Service Radius"
                value={
                  user.service_radius_km != null
                    ? `${user.service_radius_km} km`
                    : "Not specified"
                }
              />

            </div>
          </section>
        )}

        {/* ================= LOCATION ================= */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-pink-100 p-2">
              <MapPin className="h-5 w-5 text-pink-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Location
              </h2>

              <p className="text-sm text-gray-500">
                Your registered service location
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="md:col-span-3">
              <InfoItem
                icon={<MapPin />}
                label="Default Address"
                value={user.default_address ?? "Not provided"}
              />
            </div>

            <InfoItem
              icon={<Navigation />}
              label="Latitude"
              value={
                user.latitude != null
                  ? String(user.latitude)
                  : "Not available"
              }
            />

            <InfoItem
              icon={<Navigation />}
              label="Longitude"
              value={
                user.longitude != null
                  ? String(user.longitude)
                  : "Not available"
              }
            />

          </div>
        </section>

      

      </div>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string|undefined;
  value: string|undefined;
}

const InfoItem: React.FC<InfoItemProps> = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">

      <div className="mt-0.5 text-gray-500 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-gray-800">
          {value}
        </p>
      </div>

    </div>
  );
};

export default Profile;