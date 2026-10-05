import React from 'react';
import API from '../api';
import { useState , useEffect} from 'react';
function Notification() {
    interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  booking_id?: number;
  payment_id?: string;
  is_read: boolean;
  created_at: string;
}
    const [notifications , setNotifications] = useState<Notification[]>([]);
    const fetchNotifications = async () => {

    try {

        const response =
            await API.get("/api/notifications");

        setNotifications(
            response.data.data
        );

    } catch (error) {

        console.error(
            "Failed to fetch notifications",
            error
        );
    }
};
useEffect(()=>{
    fetchNotifications();
},[])
  return (
    <div className='flex flex-col justify-center items-center text-white m-10'>
      {notifications.map((notification) => (
    <div
        key={notification.id}
        className={`p-4 border rounded-lg 
            m-5
            ${
            notification.is_read
                ? "bg-white"
                : "bg-blue-50"
        }`}
    >
        <h3 className="font-semibold text-teal-500">
            {notification.title}
        </h3>

        <p className="text-sm text-gray-600">
            {notification.message}
        </p>

        <span className="text-xs text-gray-400">
            {new Date(
                notification.created_at
            ).toLocaleString()}
        </span>
    </div>
))}
    </div>
  );
}

export default Notification;
