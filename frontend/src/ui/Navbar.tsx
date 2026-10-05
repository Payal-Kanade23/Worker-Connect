import { Feather, Search ,Plus, Bell, Accessibility } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const ACCENT = {
  text: "text-white",
  bg: "bg-black",
  bgHover: "hover:bg-emerald-700",
  ring: "ring-emerald-600/15",
  soft: "bg-emerald-50",
};
const MONOGRAM_GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
];
function gradientFor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return MONOGRAM_GRADIENTS[sum % MONOGRAM_GRADIENTS.length];
}

export function Navbar() {

    const navigate = useNavigate();
  return (
    <div>
       <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className=" flex h-full max-w-[1800px] items-center justify-between px-4 lg:px-4">
          {/* Brand */}
          <div className="flex items-center gap-2 ">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Feather size={16} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              WeeConnect
            </span>
          </div>

          {/* Search */}
        

          {/* Right side */}
          <div className="flex items-center gap-3">
           
             <Link to={"/book/request"}>
             <Bell size={20}/>
            </Link>
            <Link to={"/payment/notification"}>
             <Accessibility size={20}/>
            </Link>
            
           
              
            
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              <button> <Link to={`/profile`}>--</Link></button>
             
                            
               {/* <div className="relative shrink-0">
                    {user?.profileImage   ? (
                      <img
                        src={`http://localhost:5000${user?.profileImage}`}
                        alt={user?.name}
                        className={`block aspect-square h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ${ACCENT.ring}`}
                      />
                    ) : (
                      <div
                        className={`aspect-square flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white `}
                      >
                        {user?.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                  </div> */}

            </div>
          </div>
        </div>
      </header>

    </div>
  );
}

export default Navbar;
