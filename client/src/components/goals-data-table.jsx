import * as React from "react"
import {
  
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

import {
  arrayMove
} from "@dnd-kit/sortable"

import {

  IconPlus,
  IconPencil,
  IconTrash,
  IconLoader,
  IconRefresh,
  IconFilter,
} from "@tabler/icons-react"
import {
  
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"

import { Input } from "@/components/ui/input"

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"

import { Progress } from "@/components/ui/progress"

import { activityService, activityHelpers } from "../services/activityService"

export const schema = z.object({
  _id: z.string(),
  date: z.string(),
  activityName: z.string(),
  activityType: z.string(),
  description: z.string(),
  quantity: z.object({
    value: z.number(),
    unit: z.string(),
  }),
  carbonFootprint: z.number(),
})

const DataTableContext = React.createContext(null)


const columns = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-sm">
        {activityHelpers.formatDate(row.original.date)}
      </div>
    ),
  },
  {
    accessorKey: "activityName",
    header: "Activity",
    cell: ({ row }) => <div className="font-medium">{row.original.activityName}</div>,
  },
  {
    accessorKey: "activityType",
    header: "Type",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge 
          variant="outline" 
          className={`text-xs px-2 py-1 capitalize ${getActivityTypeColor(row.original.activityType)}`}
        >
          {row.original.activityType}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-sm max-w-xs truncate" title={row.original.description}>
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <div className="text-sm">
        {activityHelpers.formatQuantity(row.original.quantity)}
      </div>
    ),
  },
  {
    accessorKey: "carbonFootprint",
    header: "CO₂ (kg)",
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {activityHelpers.formatCarbonFootprint(row.original.carbonFootprint)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const ctx = React.useContext(DataTableContext)
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => ctx.handleEdit(row.original)}
          >
            <IconPencil size={16} className="mr-1" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => ctx.handleRemove(row.original._id)}
            disabled={ctx.isDeleting === row.original._id}
          >
            {ctx.isDeleting === row.original._id ? (
              <IconLoader size={16} className="mr-1 animate-spin" />
            ) : (
              <IconTrash size={16} className="mr-1" />
            )}
            Remove
          </Button>
        </div>
      )
    },
  },
]



export function DataTable({ onAddActivity, onEditActivity }) {
  const [data, setData] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [sorting, setSorting] = React.useState([{ id: "date", desc: true }])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [loading, setLoading] = React.useState(true)
  const [isDeleting, setIsDeleting] = React.useState(null)
  
  // FIXED: Proper filter state initialization - no "all" values
  const [filters, setFilters] = React.useState({
    activityType: "",
    activityName: "",
    startDate: "",
    endDate: "",
  })
  
  const [totalCarbonFootprint, setTotalCarbonFootprint] = React.useState(0)

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo(() => data?.map((item) => item._id) || [], [data])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row._id,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
  })

  // FIXED: Improved fetchActivities with proper parameter handling
  const fetchActivities = React.useCallback(async () => {
    try {
      setLoading(true)
      
      // Build clean filter parameters - only include non-empty values
      const filterParams = {}
      
      if (filters.activityType && filters.activityType.trim() !== "") {
        filterParams.activityType = filters.activityType.trim()
      }
      
      if (filters.activityName && filters.activityName.trim() !== "") {
        filterParams.activityName = filters.activityName.trim()
      }
      
      if (filters.startDate) {
        filterParams.startDate = filters.startDate
      }
      
      if (filters.endDate) {
        filterParams.endDate = filters.endDate
      }
      
      // Get all activities for client-side pagination
      filterParams.limit = 1000
      
      console.log("Sending filter params to API:", filterParams)
      
      const response = await activityService.getActivities(filterParams)
      
      console.log("API Response:", response)
      
      setData(response.activities || [])
      setTotalCarbonFootprint(response.summary?.totalCarbonFootprint || 0)
      
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      setData([])
      toast.error("Failed to fetch activities. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch activities when component mounts or filters change
  React.useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  function handleDragEnd(event) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  function handleEdit(activity) {
    if (onEditActivity) {
      onEditActivity(activity)
    } else {
      console.log("Edit activity:", activity)
    }
  }

  async function handleRemove(activityId) {
    try {
      setIsDeleting(activityId)
      await activityService.deleteActivity(activityId)
      
      // Remove from local state immediately
      setData((prev) => prev.filter((item) => item._id !== activityId))
      
      toast.success("Activity deleted successfully.")
      
      // Refresh to get updated totals
      fetchActivities()
    } catch (error) {
      console.error("Failed to delete activity:", error)
      toast.error("Failed to delete activity. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  // FIXED: Simplified filter change handler
  const handleFilterChange = (key, value) => {
    console.log(`Filter change: ${key} = "${value}"`)
    
    // Handle the special "all" case for activityType
    let actualValue = value
    if (key === "activityType" && value === "all") {
      actualValue = ""
    }
    
    setFilters((prev) => ({
      ...prev,
      [key]: actualValue,
    }))
    
    // Reset to first page when filters change
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0
    }))
  }

  // FIXED: Clear filters function
  const clearFilters = () => {
    console.log("Clearing all filters")
    setFilters({
      activityType: "",
      activityName: "",
      startDate: "",
      endDate: "",
    })
  }

  // FIXED: Check for active filters (any non-empty value)
  const hasActiveFilters = 
    filters.activityType !== "" || 
    filters.activityName !== "" || 
    filters.startDate !== "" || 
    filters.endDate !== ""

  return (
   
      <Tabs defaultValue="logs" className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between px-4 lg:px-6">
          <TabsList>
            <TabsTrigger value="logs">
              Your highest emmission contribution is from
              {totalCarbonFootprint > 0 && (
                <Badge variant="secondary" className="ml-2">
                  Total: {activityHelpers.formatCarbonFootprint(totalCarbonFootprint)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
           
          
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAddActivity}
            >
              <IconPlus />
              <span className="hidden lg:inline">Set a Reduction Target</span>
            </Button>
          </div>
        </div>

        {/* FIXED: Filters section with proper value handling */}
        <div className="px-4 lg:px-6">
          <div className="flex flex-wrap gap-4 items-end p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <IconFilter size={16} />
              <span className="text-sm font-medium">Reduction progress(40%):</span>
            </div>
            <Progress value={40} />
        
            <div className="flex flex-col gap-1">
              <Label htmlFor="activity-name" className="text-xs">3 Days left |</Label>
            
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="start-date" className="text-xs">Target : 15 CO₂ |</Label>
             
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="end-date" className="text-xs">Tip: You approuching the target too early, try cycling tomorrow instead, and cook only for a 5 min max.</Label>
           
            </div>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-8"
              >
                Clear filters
              </Button>
              
            )}
          </div>
        </div>

      </Tabs>
 
  )
}
