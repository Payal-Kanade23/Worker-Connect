
import React, { useState } from "react";
import type { CurrentUser } from "../../../context/authContext";
import { useAuth } from "../../../context/authContext";
import {
  User,
  Phone,
  Briefcase,
  IndianRupee,
  Clock,
  Navigation,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { editProfile, type editData } from "../api/profile.api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
interface Props {
  user: CurrentUser;
}


const WorkerProfileForm: React.FC<Props> = ({ user }) => {
  const [form, setForm] = useState<editData>({
    name: user.name ?? "",
    phone: user.phone ?? "",
    employment_type: user.employment_type ?? "",
    hourly_rate: user.hourly_rate ?? 0,
    hour_per_day: user.hour_per_day ?? 0,
    available_from: user.available_from ?? "",
    available_to: user.available_to ?? "",
    service_radius_km: user.service_radius_km ?? 0,
    latitude: user.latitude ?? 0,
    longitude: user.longitude ?? 0,
  });
  const navigate = useNavigate();

  const { refreshUser } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      console.error("Failed to update worker profile", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-6 sm:px-8">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Worker Profile
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your personal and professional information
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
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* Professional Information */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Professional Information
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage your work and service details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* Employment Type */}
                <div>
                  <label
                    htmlFor="employment_type"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Employment Type
                  </label>

                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <select
                      id="employment_type"
                      name="employment_type"
                      value={form.employment_type}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Select Employment Type
                      </option>

                      <option value="full_time">
                        Full Time
                      </option>

                      <option value="part_time">
                        Part Time
                      </option>
                    </select>
                  </div>
                </div>

                {/* Hourly Rate */}
                <div>
                  <label
                    htmlFor="hourly_rate"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Hourly Rate
                  </label>

                  <div className="relative">
                    <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      id="hourly_rate"
                      type="number"
                      name="hourly_rate"
                      min="0"
                      value={form.hourly_rate}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Hours Per Day */}
                <div>
                  <label
                    htmlFor="hour_per_day"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Hours Per Day
                  </label>

                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      id="hour_per_day"
                      type="number"
                      name="hour_per_day"
                      min="1"
                      max="24"
                      value={form.hour_per_day}
                      onChange={handleChange}
                      placeholder="e.g. 8"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Available From */}
                <div>
                  <label
                    htmlFor="available_from"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Available From
                  </label>

                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      id="available_from"
                      type="time"
                      name="available_from"
                      value={form.available_from}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Available To */}
                <div>
                  <label
                    htmlFor="available_to"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Available Until
                  </label>

                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      id="available_to"
                      type="time"
                      name="available_to"
                      value={form.available_to}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
                </div>

                {/* Service Radius */}
                <div>
                  <label
                    htmlFor="service_radius_km"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Service Radius
                  </label>

                  <div className="relative">
                    <Navigation className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      id="service_radius_km"
                      type="number"
                      name="service_radius_km"
                      min="1"
                      value={form.service_radius_km}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-gray-400">
                    Maximum distance you are willing to travel.
                  </p>
                </div>

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
            </section>

            {/* Save Buttons */}
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

export default WorkerProfileForm;
