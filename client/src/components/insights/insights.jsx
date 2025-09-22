import { useState } from "react"

import DashboardNavbar from "@/components/sidebar/dashboardNavbar"

import ActivityLogDialog from "@/components/ActivityLogDialog"

export default function Dashboard() {
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)

  const handleAddActivity = () => {
    setIsActivityDialogOpen(true)
  }



  const handleActivitySaved = () => {
    setIsActivityDialogOpen(false)
    // Optionally refresh data or show success message
  }

  return (
    <div>
      <DashboardNavbar 
        onAddActivity={handleAddActivity}
      />
      
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
           
          </div>
        </div>
      </div>

      {/* Activity Dialog */}
      <ActivityLogDialog 
        open={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
        onActivitySaved={handleActivitySaved}
      />
    </div>
  )
}