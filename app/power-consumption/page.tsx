"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Zap, Info } from "lucide-react"
import type { MachineData } from "@/lib/firebaseService"
import { calculatePowerData } from "@/lib/calculations"
import Navbar from "@/components/navbar"
import Link from "next/link"

export default function PowerConsumptionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MachineData["powerData"]>({
    machinePower: 0,
    effectiveRunningTimeOfMotors: 0,
    powerOfFan: 0,
    powerOfLight: 0,
    numberOfFansAroundMachine: 0,
    numberOfLightsAroundMachine: 0,
    compressorPower: 0,
    numberOfMachinesConnectedWithCompressor: 0,
    effectiveRunningTimeOfCompressor: 0,
    powerOfOtherElectricalEquipment: 0,
    utilization: 0,
    ebUnitRate: 0,
    dieselConsumptionByGenset: 0,
    dieselCostPerLitre: 0,
    gensetPower: 0,
    electricityUnitRate: 0,
  })
  const [calculatedData, setCalculatedData] = useState<any>({})
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn !== "true") {
      router.push("/")
      return
    }

    // Load existing data if available
    const savedData = localStorage.getItem("currentMachine")
    if (savedData) {
      const machineData: MachineData = JSON.parse(savedData)
      if (machineData.powerData) {
        setFormData(machineData.powerData)
      }
    }
  }, [router])

  useEffect(() => {
    if (formData.dieselConsumptionByGenset > 0 && formData.dieselCostPerLitre > 0 && formData.gensetPower > 0) {
      const calculated = calculatePowerData(formData)
      setCalculatedData(calculated)
    }
  }, [formData])

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.machinePower || formData.machinePower <= 0) newErrors.machinePower = "Valid machine power is required"
    if (!formData.electricityUnitRate || formData.electricityUnitRate <= 0)
      newErrors.electricityUnitRate = "Valid electricity unit rate is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof MachineData["powerData"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number.parseFloat(value) || 0,
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const saveAndContinue = () => {
    if (!validateForm()) return

    const existingData = localStorage.getItem("currentMachine")
    if (!existingData) {
      router.push("/investment")
      return
    }

    const machineData: MachineData = JSON.parse(existingData)
    machineData.powerData = { ...formData, ...calculatedData }

    localStorage.setItem("currentMachine", JSON.stringify(machineData))
    router.push("/consumables")
  }

  const goBack = () => {
    router.push("/space-expenses")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Power Consumption" currentStep={3} totalSteps={7} />

      <main className="md:ml-64 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/investment" className="hover:text-blue-600">
              Investment
            </Link>
            <span>/</span>
            <Link href="/space-expenses" className="hover:text-blue-600">
              Space Expenses
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Power Consumption</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Power Consumption</h1>
                <p className="text-gray-600">
                  Enter power consumption details for the machine and associated equipment
                </p>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This information will be used to calculate hourly power costs including machine motors, lighting, fans,
                and other electrical equipment.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-6">
            {/* Machine Power */}
            <Card>
              <CardHeader>
                <CardTitle>Machine Power Details</CardTitle>
                <CardDescription>Enter the main machine power specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="machinePower" className="text-sm font-medium">
                      Machine Power (kW) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="machinePower"
                      type="number"
                      step="0.01"
                      value={formData.machinePower || ""}
                      onChange={(e) => handleInputChange("machinePower", e.target.value)}
                      placeholder="e.g., 15.5"
                      className={`h-11 ${errors.machinePower ? "border-red-500" : ""}`}
                    />
                    {errors.machinePower && <p className="text-sm text-red-600">{errors.machinePower}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effectiveRunningTimeOfMotors" className="text-sm font-medium">
                      Effective Running Time of Motors (%)
                    </Label>
                    <Input
                      id="effectiveRunningTimeOfMotors"
                      type="number"
                      value={formData.effectiveRunningTimeOfMotors || ""}
                      onChange={(e) => handleInputChange("effectiveRunningTimeOfMotors", e.target.value)}
                      placeholder="e.g., 80"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utilization" className="text-sm font-medium">
                      Machine Utilization (%)
                    </Label>
                    <Input
                      id="utilization"
                      type="number"
                      value={formData.utilization || ""}
                      onChange={(e) => handleInputChange("utilization", e.target.value)}
                      placeholder="e.g., 85"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auxiliary Equipment */}
            <Card>
              <CardHeader>
                <CardTitle>Auxiliary Equipment</CardTitle>
                <CardDescription>Enter power consumption for fans, lights, and other equipment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="powerOfFan" className="text-sm font-medium">
                      Power of Fan (Watts)
                    </Label>
                    <Input
                      id="powerOfFan"
                      type="number"
                      value={formData.powerOfFan || ""}
                      onChange={(e) => handleInputChange("powerOfFan", e.target.value)}
                      placeholder="e.g., 75"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfFansAroundMachine" className="text-sm font-medium">
                      Number of Fans Around Machine
                    </Label>
                    <Input
                      id="numberOfFansAroundMachine"
                      type="number"
                      value={formData.numberOfFansAroundMachine || ""}
                      onChange={(e) => handleInputChange("numberOfFansAroundMachine", e.target.value)}
                      placeholder="e.g., 2"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="powerOfLight" className="text-sm font-medium">
                      Power of Light (Watts)
                    </Label>
                    <Input
                      id="powerOfLight"
                      type="number"
                      value={formData.powerOfLight || ""}
                      onChange={(e) => handleInputChange("powerOfLight", e.target.value)}
                      placeholder="e.g., 40"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfLightsAroundMachine" className="text-sm font-medium">
                      Number of Lights Around Machine
                    </Label>
                    <Input
                      id="numberOfLightsAroundMachine"
                      type="number"
                      value={formData.numberOfLightsAroundMachine || ""}
                      onChange={(e) => handleInputChange("numberOfLightsAroundMachine", e.target.value)}
                      placeholder="e.g., 4"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="powerOfOtherElectricalEquipment" className="text-sm font-medium">
                      Power of Other Electrical Equipment (Watts)
                    </Label>
                    <Input
                      id="powerOfOtherElectricalEquipment"
                      type="number"
                      value={formData.powerOfOtherElectricalEquipment || ""}
                      onChange={(e) => handleInputChange("powerOfOtherElectricalEquipment", e.target.value)}
                      placeholder="e.g., 500"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compressor Details */}
            <Card>
              <CardHeader>
                <CardTitle>Compressor Details</CardTitle>
                <CardDescription>Enter compressor power and sharing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="compressorPower" className="text-sm font-medium">
                      Compressor Power (kW)
                    </Label>
                    <Input
                      id="compressorPower"
                      type="number"
                      step="0.01"
                      value={formData.compressorPower || ""}
                      onChange={(e) => handleInputChange("compressorPower", e.target.value)}
                      placeholder="e.g., 7.5"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfMachinesConnectedWithCompressor" className="text-sm font-medium">
                      Number of Machines Connected with Compressor
                    </Label>
                    <Input
                      id="numberOfMachinesConnectedWithCompressor"
                      type="number"
                      value={formData.numberOfMachinesConnectedWithCompressor || ""}
                      onChange={(e) => handleInputChange("numberOfMachinesConnectedWithCompressor", e.target.value)}
                      placeholder="e.g., 5"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effectiveRunningTimeOfCompressor" className="text-sm font-medium">
                      Effective Running Time of Compressor (%)
                    </Label>
                    <Input
                      id="effectiveRunningTimeOfCompressor"
                      type="number"
                      value={formData.effectiveRunningTimeOfCompressor || ""}
                      onChange={(e) => handleInputChange("effectiveRunningTimeOfCompressor", e.target.value)}
                      placeholder="e.g., 60"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Electricity Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Electricity Rates</CardTitle>
                <CardDescription>Enter electricity and generator costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="electricityUnitRate" className="text-sm font-medium">
                      Electricity Unit Rate (₹/kWh) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="electricityUnitRate"
                      type="number"
                      step="0.01"
                      value={formData.electricityUnitRate || ""}
                      onChange={(e) => handleInputChange("electricityUnitRate", e.target.value)}
                      placeholder="e.g., 8.50"
                      className={`h-11 ${errors.electricityUnitRate ? "border-red-500" : ""}`}
                    />
                    {errors.electricityUnitRate && <p className="text-sm text-red-600">{errors.electricityUnitRate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ebUnitRate" className="text-sm font-medium">
                      EB Unit Rate (₹/kWh)
                    </Label>
                    <Input
                      id="ebUnitRate"
                      type="number"
                      step="0.01"
                      value={formData.ebUnitRate || ""}
                      onChange={(e) => handleInputChange("ebUnitRate", e.target.value)}
                      placeholder="e.g., 7.50"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dieselConsumptionByGenset" className="text-sm font-medium">
                      Diesel Consumption by Genset (liters/hr)
                    </Label>
                    <Input
                      id="dieselConsumptionByGenset"
                      type="number"
                      step="0.01"
                      value={formData.dieselConsumptionByGenset || ""}
                      onChange={(e) => handleInputChange("dieselConsumptionByGenset", e.target.value)}
                      placeholder="e.g., 3.5"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dieselCostPerLitre" className="text-sm font-medium">
                      Diesel Cost per Litre (₹)
                    </Label>
                    <Input
                      id="dieselCostPerLitre"
                      type="number"
                      step="0.01"
                      value={formData.dieselCostPerLitre || ""}
                      onChange={(e) => handleInputChange("dieselCostPerLitre", e.target.value)}
                      placeholder="e.g., 85.00"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gensetPower" className="text-sm font-medium">
                      Genset Power (kW)
                    </Label>
                    <Input
                      id="gensetPower"
                      type="number"
                      step="0.01"
                      value={formData.gensetPower || ""}
                      onChange={(e) => handleInputChange("gensetPower", e.target.value)}
                      placeholder="e.g., 100"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculated Values */}
            {calculatedData.gensetUnitRate && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Power Cost Analysis</CardTitle>
                  <CardDescription className="text-green-700">
                    Calculated power costs based on your inputs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-800 mb-1">Genset Unit Rate</div>
                      <div className="text-2xl font-bold text-green-900">
                        ₹{calculatedData.gensetUnitRate?.toFixed(2)}/kWh
                      </div>
                      <div className="text-xs text-green-600 mt-1">Calculated from diesel consumption</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Button variant="outline" onClick={goBack} className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={saveAndContinue}
                disabled={!formData.machinePower || !formData.electricityUnitRate}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Save & Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
