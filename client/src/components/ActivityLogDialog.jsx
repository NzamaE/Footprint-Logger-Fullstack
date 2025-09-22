import { useState, useEffect } from "react"
import { CalendarIcon, Loader } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { activityService, activityHelpers } from "@/services/activityService"
import { useForm } from "react-hook-form"
import { cn } from "@/lib/utils"

export default function ActivityLogDialog({ open, onOpenChange, onActivitySaved }) {
  const [loading, setLoading] = useState(false)
  const [calculatingPreview, setCalculatingPreview] = useState(false)
  const [carbonPreview, setCarbonPreview] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const form = useForm({
    defaultValues: {
      activityName: "",
      activityType: "",
      description: "",
      quantity: {
        value: "",
        unit: ""
      },
      activityDetails: {}
    }
  })

  const watchedActivityType = form.watch("activityType")
  const watchedQuantity = form.watch("quantity")
  const watchedActivityDetails = form.watch("activityDetails")

  // Calculate carbon preview when relevant fields change
  useEffect(() => {
    const calculatePreview = async () => {
      if (watchedActivityType && watchedQuantity?.value && watchedQuantity?.unit) {
        try {
          setCalculatingPreview(true)
          const preview = await activityService.calculateCarbonPreview({
            activityType: watchedActivityType,
            quantity: {
              value: parseFloat(watchedQuantity.value),
              unit: watchedQuantity.unit
            },
            activityDetails: watchedActivityDetails
          })
          setCarbonPreview(preview)
        } catch (error) {
          console.error("Failed to calculate preview:", error)
          setCarbonPreview(null)
        } finally {
          setCalculatingPreview(false)
        }
      } else {
        setCarbonPreview(null)
      }
    }

    const timeoutId = setTimeout(calculatePreview, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [watchedActivityType, watchedQuantity, watchedActivityDetails])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      const activityData = {
        ...data,
        quantity: {
          value: parseFloat(data.quantity.value),
          unit: data.quantity.unit
        },
        date: new Date().toISOString(), // Always use current time for submission
        activityDetails: data.activityDetails || {}
      }

      await activityService.createActivity(activityData)
      
      toast.success("Activity logged successfully!")

      // Reset form and close dialog
      form.reset()
      setCarbonPreview(null)
      onActivitySaved?.()
      
    } catch (error) {
      console.error("Failed to log activity:", error)
      toast.error(error.message || "Failed to log activity. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setCarbonPreview(null)
    onOpenChange(false)
  }

  const getActivitySpecificFields = () => {
    switch (watchedActivityType) {
      case 'transport':
        return (
          <FormField
            control={form.control}
            name="activityDetails.transportMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport Mode *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activityHelpers.getTransportModes().map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{mode.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {mode.emissionIntensity}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      
      case 'energy':
        return (
          <FormField
            control={form.control}
            name="activityDetails.energySource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Energy Source *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select energy source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activityHelpers.getEnergySources().map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{source.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {source.emissionIntensity}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      
      case 'food':
        return (
          <FormField
            control={form.control}
            name="activityDetails.foodType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Food Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select food type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activityHelpers.getFoodTypes().map((food) => (
                      <SelectItem key={food.value} value={food.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{food.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {food.emissionIntensity}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      
      case 'waste':
        return (
          <>
            <FormField
              control={form.control}
              name="activityDetails.wasteType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waste Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select waste type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityHelpers.getWasteTypes().map((waste) => (
                        <SelectItem key={waste.value} value={waste.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{waste.label}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {waste.emissionIntensity}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activityDetails.disposalMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disposal Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select disposal method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityHelpers.getDisposalMethods().map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{method.label}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {method.emissionIntensity}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )
      
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log New Activity</DialogTitle>
          <DialogDescription>
            Add a new carbon footprint activity. The system will automatically calculate the CO₂ emissions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="activityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Morning commute" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityHelpers.getActivityTypes().map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the activity..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity.value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity.unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityHelpers.getQuantityUnitsByType(watchedActivityType).map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Activity-specific fields */}
            {getActivitySpecificFields()}

            {/* Optional: Date field can be removed entirely since we're using current time
            <FormItem>
              <FormLabel>Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
            */}

            {/* Show current time info instead */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <CalendarIcon className="h-4 w-4" />
              <span>Activity will be logged at: <strong>{format(new Date(), "PPP 'at' p")}</strong></span>
            </div>

            {/* Carbon Footprint Preview */}
            {(carbonPreview || calculatingPreview) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Carbon Footprint Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {calculatingPreview ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Calculating...</span>
                    </div>
                  ) : carbonPreview ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Estimated CO₂:</span>
                        <Badge variant="secondary" className="font-mono">
                          {activityHelpers.formatCarbonFootprint(carbonPreview.calculatedCarbonFootprint)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Emission factor: {carbonPreview.emissionFactor} kg CO₂/{carbonPreview.calculation.quantity?.replace(/[\d.]/g, '')}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  "Log Activity"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}