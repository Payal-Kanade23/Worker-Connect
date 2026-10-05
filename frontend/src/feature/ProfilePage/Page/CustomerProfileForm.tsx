
import React, { useState } from "react";
import type { CurrentUser } from "../../../context/authContext";
import API from "../../../api";
import { useAuth } from "../../../context/authContext";
import { User, Phone, MapPin, Navigation, Save } from "lucide-react";
import { editProfile } from "../api/profile.api";
import type { editData } from "../api/profile.api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
interface Props {
  user: CurrentUser;
}
import { Link } from "react-router-dom";
const CustomerProfileForm: React.FC<Props> = ({ user }) => {
  const [form, setForm] = useState<editData>({
    name: user.name ?? "",
    phone: user.phone ?? "",
    default_address: user.default_address ?? "",
    latitude: user.latitude ?? 0,
    longitude: user.longitude ?? 0,
  });

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await editProfile(form);
            navigate("/profile")


      await refreshUser();
      toast.success(res.message)

    } catch (error) {
      console.error("Failed to update customer profile", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-6 sm:px-8">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <User className="h-6 w-6 text-purple-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Customer Profile
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your personal and location information
                </p>
              </div>

            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-8 p-6 sm:p-8"
          >

            {/* Personal Information */}
            <section>
              <div className="mb-5">
                <h3 className="text-base font-semibold text-gray-900">
                  Personal Information
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Keep your contact details up to date.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* Location Information */}
            <section>
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />

                  <h3 className="text-base font-semibold text-gray-900">
                    Location Information
                  </h3>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Add your default service location.
                </p>
              </div>

              <div className="space-y-5">

                {/* Address */}
                <div>
                  <label
                    htmlFor="default_address"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Default Address
                  </label>

                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                    <input
                      id="default_address"
                      name="default_address"
                      type="text"
                      value={form.default_address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* Latitude */}
                  <div>
                    <label
                      htmlFor="latitude"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Latitude
                    </label>

                    <div className="relative">
                      <Navigation className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                      <input
                        id="latitude"
                        name="latitude"
                        type="number"
                        step="any"
                        value={form.latitude}
                        onChange={handleChange}
                        placeholder="e.g. 21.1702"
                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>

                  {/* Longitude */}
                  <div>
                    <label
                      htmlFor="longitude"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Longitude
                    </label>

                    <div className="relative">
                      <Navigation className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                      <input
                        id="longitude"
                        name="longitude"
                        type="number"
                        step="any"
                        value={form.longitude}
                        onChange={handleChange}
                        placeholder="e.g. 72.8311"
                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
            <Link to="/profile">
                  Cancel
                </Link>
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileForm;
