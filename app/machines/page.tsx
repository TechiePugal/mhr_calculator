"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Plus, Calculator } from "lucide-react"
import { type MachineData, getAllMachines, deleteMachine } from "@/lib/firebaseService"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MachinesPage() {
  const router = useRouter()
  const [machines, setMachines] = useState<MachineData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn !== "true") {
      router.push("/")
      return
    }

    loadMachines()
  }, [router])

  const loadMachines = async () => {
    try {
      const machineList = await getAllMachines()
      setMachines(machineList)
    } catch (error) {
      console.error("Error loading machines:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (machine: MachineData) => {
    localStorage.setItem("currentMachine", JSON.stringify(machine))
    router.push("/investment")
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMachine(id)
      setMachines(machines.filter((m) => m.id !== id))
    } catch (error) {
      console.error("Error deleting machine:", error)
    }
  }

  const startNewCalculation = () => {
    localStorage.removeItem("currentMachine")
    router.push("/investment")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading machines...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 ml-4">Machines</h1>
            </div>
            <Button onClick={startNewCalculation}>
              <Plus className="w-4 h-4 mr-2" />
              New Machine
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {machines.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No machines found</h3>
                <p className="text-gray-600 mb-4">Start by creating your first machine calculation</p>
                <Button onClick={startNewCalculation}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Machine
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {machines.map((machine) => (
                <Card key={machine.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{machine.machineName}</CardTitle>
                        <CardDescription>
                          {machine.investmentData.machineCost
                            ? `₹${machine.investmentData.machineCost.toLocaleString()}`
                            : "No cost data"}
                        </CardDescription>
                      </div>
                      {machine.calculationData?.machineHourRate && (
                        <Badge variant="secondary">₹{machine.calculationData.machineHourRate.toFixed(2)}/hr</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Life:</span>
                        <span>{machine.investmentData.lifeOfMachine || 0} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Working Hours:</span>
                        <span>{machine.investmentData.workingHoursPerDay || 0} hrs/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Power:</span>
                        <span>{machine.powerData.machinePower || 0} kW</span>
                      </div>
                      {machine.calculationData && (
                        <div className="flex justify-between font-medium">
                          <span>Profit:</span>
                          <span>{machine.calculationData.profit}%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(machine)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the machine "
                              {machine.machineName}" and all its data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(machine.id!)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
