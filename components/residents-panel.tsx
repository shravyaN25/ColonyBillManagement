"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { useResidents, type Resident } from "@/hooks/use-residents"
import { toast } from "@/components/ui/use-toast"
import { useNotification } from "@/components/notification-provider"

export function ResidentsPanel() {
  const { residents, isLoading, addResident, updateResident, deleteResident } = useResidents()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isForceDeleteDialogOpen, setIsForceDeleteDialogOpen] = useState(false)
  const [currentResident, setCurrentResident] = useState<Resident | null>(null)
  const [billCount, setBillCount] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    flatNumber: "",
    email: "",
    phone: "",
  })

  const filteredResidents = residents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      flatNumber: "",
      email: "",
      phone: "",
    })
  }

  const { showNotification } = useNotification()

  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newResident = await addResident(formData)
      resetForm()
      setIsAddDialogOpen(false)
      toast({
        title: "Resident Added",
        description: `${newResident.name} has been successfully added to flat ${newResident.flatNumber}.`,
        variant: "default",
      })
      showNotification(`${newResident.name} has been successfully added to flat ${newResident.flatNumber}.`, "success")
    } catch (error) {
      console.error("Error in handleAddResident:", error)
      // Error is already handled in addResident function
    }
  }

  const handleUpdateResident = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentResident) {
      try {
        await updateResident(currentResident.id, formData)
        resetForm()
        setIsEditDialogOpen(false)
        toast({
          title: "Resident Updated",
          description: `${formData.name}'s information has been successfully updated.`,
          variant: "default",
        })
        showNotification(`${formData.name}'s information has been successfully updated.`, "success")
      } catch (error) {
        console.error("Error in handleUpdateResident:", error)
        // Error is already handled in updateResident function
      }
    }
  }

  const handleDeleteResident = async () => {
    if (currentResident) {
      try {
        const result = await deleteResident(currentResident.id)

        // Check if the result indicates the resident has bills
        if (result && !result.success && result.hasBills) {
          setIsDeleteDialogOpen(false)
          setBillCount(result.billCount || 0)
          setIsForceDeleteDialogOpen(true)
          return // Exit early
        }

        // If we get here, the deletion was successful
        setIsDeleteDialogOpen(false)
        toast({
          title: "Resident Deleted",
          description: `${currentResident.name} has been removed from the system.`,
          variant: "default",
        })
        showNotification(`${currentResident.name} has been removed from the system.`, "info")
      } catch (error) {
        console.error("Error in handleDeleteResident:", error)

        // For other errors, close the dialog and show the error in a toast
        setIsDeleteDialogOpen(false)
        toast({
          title: "Error Deleting Resident",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        })
      }
    }
  }

  const handleForceDeleteResident = async () => {
    if (currentResident) {
      try {
        await deleteResident(currentResident.id, true) // Pass true to force delete
        setIsForceDeleteDialogOpen(false)
        toast({
          title: "Resident Deleted",
          description: `${currentResident.name} has been removed from the system along with all associated bills.`,
          variant: "default",
        })
        showNotification(
          `${currentResident.name} has been removed from the system along with all associated bills.`,
          "info",
        )
      } catch (error) {
        console.error("Error in handleForceDeleteResident:", error)
        // Error is already handled in deleteResident function
      }
    }
  }

  const handleEditClick = (resident: Resident) => {
    setCurrentResident(resident)
    setFormData({
      name: resident.name,
      flatNumber: resident.flatNumber,
      email: resident.email,
      phone: resident.phone,
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (resident: Resident) => {
    setCurrentResident(resident)
    setIsDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Residents Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" /> Add Resident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAddResident}>
              <DialogHeader>
                <DialogTitle>Add New Resident</DialogTitle>
                <DialogDescription>Enter the details of the new resident below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flatNumber">Flat Number</Label>
                    <Input
                      id="flatNumber"
                      placeholder="e.g., A-101"
                      value={formData.flatNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsAddDialogOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Save Resident
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search residents by name, flat number, or email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flat No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResidents.length > 0 ? (
              filteredResidents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">{resident.flatNumber}</TableCell>
                  <TableCell>{resident.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{resident.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{resident.phone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(resident)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(resident)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  {searchTerm
                    ? "No residents found. Try a different search term."
                    : "No residents added yet. Add your first resident."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleUpdateResident}>
            <DialogHeader>
              <DialogTitle>Edit Resident</DialogTitle>
              <DialogDescription>Update the resident's information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flatNumber">Flat Number</Label>
                  <Input
                    id="flatNumber"
                    placeholder="e.g., A-101"
                    value={formData.flatNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsEditDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Update Resident
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the resident {currentResident?.name} from the system. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResident} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Delete Confirmation Dialog */}
      <AlertDialog open={isForceDeleteDialogOpen} onOpenChange={setIsForceDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Warning: Resident Has Bills
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">
                {currentResident?.name} has {billCount} bill{billCount !== 1 ? "s" : ""} in the system. Deleting this
                resident will also delete all associated bills.
              </p>
              <p className="font-semibold text-amber-600">
                This action cannot be undone. Are you sure you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceDeleteResident} className="bg-amber-600 hover:bg-amber-700">
              Delete Resident and Bills
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

