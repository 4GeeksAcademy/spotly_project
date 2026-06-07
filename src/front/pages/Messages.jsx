import { MessageCircle } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";

export const Messages = () => {
  return (
    <div className="spotly-dashboard">
      <DashboardSidebar />

      <main className="dashboard-main">
        <div className="messages-page">
          <div className="messages-empty">
            <MessageCircle size={48} />
            <h1>Direct Messages</h1>
            <p>En construcción</p>
          </div>
        </div>
      </main>
    </div>
  );
};