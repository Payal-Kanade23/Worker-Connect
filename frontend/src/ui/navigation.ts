import { Bell, CheckCircle, CirclePlus, CircleUser, Layers, LayoutDashboard, Logs, MessageCircle, ShieldCheck, UserPlus, Users } from "lucide-react"
import type { Role } from "../api";
import { PERMISSIONS , type Permission} from "../utils/permission";

interface NavItem {
    label:string,
    icon:React.ElementType;
    href?:string,
    onClick?:()=>void,
    allowedRoles?:Role[],
    permission?:string
   
  
}

export const navigation:NavItem[]= [
    {
        label:"Dashboard",
        icon:LayoutDashboard,
        href:"/dashboard",
        permission:PERMISSIONS.VIEW_DASHBOARD,
        allowedRoles:["admin","worker","customer"]
    },
   
    {
        label:"Audit Logs",
        icon:Logs,
        href:"/audit",
        permission:PERMISSIONS.VIEW_LOGS,
         allowedRoles:["admin"]

    },
    {
        label:"profile",
        icon:CirclePlus,
        href:"/profile",
         allowedRoles:["worker","customer"],
        permission:PERMISSIONS.VIEW_PROFILE
        


    },
    {
        label:"Booked Services",
        icon:CheckCircle,
        href:"/booked/request",
        allowedRoles:['worker','customer'],
        
    }
    
   
  
   
   
    
    
] 