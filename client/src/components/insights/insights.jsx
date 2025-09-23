import { useState } from "react"
import DashboardNavbar from "@/components/sidebar/dashboardNavbar"
import ActivityLogDialog from "@/components/ActivityLogDialog"

export default function Insights() {
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
            {/* Insights content will go here */}
            <div className="px-4 lg:px-6">
              <div className="text-center py-12">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Carbon Footprint Insights
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Insights functionality coming soon...
                </p>
              </div>
            </div>
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