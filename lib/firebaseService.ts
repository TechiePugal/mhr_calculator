import { db } from "./firebase"
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, serverTimestamp } from "firebase/firestore"

export interface MachineData {
  id?: string
  machineName: string
  investmentData: {
    machineCost: number
    lifeOfMachine: number
    workingHoursPerDay: number
    balanceLifeOfMachine: number
    interestRate: number
    scrapRate: number
    machineLifeHours?: number
    currentValueOfMachine?: number
  }
  spaceData: {
    factoryRentPerMonth: number
    factorySpaceInSqFt: number
    spaceOccupiedByMachine: number
    numberOfMachinesInFactory: number
    commonSpaceInSqFt: number
  }
  powerData: {
    machinePower: number
    effectiveRunningTimeOfMotors: number
    powerOfFan: number
    powerOfLight: number
    numberOfFansAroundMachine: number
    numberOfLightsAroundMachine: number
    compressorPower: number
    numberOfMachinesConnectedWithCompressor: number
    effectiveRunningTimeOfCompressor: number
    powerOfOtherElectricalEquipment: number
    utilization: number
    ebUnitRate: number
    dieselConsumptionByGenset: number
    dieselCostPerLitre: number
    gensetPower: number
    gensetEfficiency?: number
    gensetUnitRate?: number
    electricityUnitRate: number
  }
  consumablesData: {
    coolantOilTopUpPerMonth: number
    coolantOilCostPerLitre: number
    wasteUsagePerMonth: number
    costOfWastePerKg: number
    monthlyMaintenanceCost: number
    annualMaintenanceCost: number
    otherConsumablesPerMonth: number
  }
  toolsWagesData: {
    averageToolCostPerMonth: number
    operatorSalaryPerMonth: number
    helperSalaryPerMonth: number
    qualityInspectorSalaryPerMonth: number
  }
  overheadsData: {
    productionSupervisorSalaryPerMonth: number
    qualitySupervisorSalaryPerMonth: number
    engineerSalaryPerMonth: number
    managerSalaryPerMonth: number
    adminStaffSalaryPerMonth: number
    noOfMachinesHandledByOperator: number
    noOfMachinesHandledByHelper: number
    noOfMachinesHandledByQualityInspector: number
    noOfMachinesHandledByProductionSupervisor: number
    noOfMachinesHandledByQualitySupervisor: number
    noOfMachinesHandledByEngineer: number
  }
  wagesSalariesData?: {
    operatorCostPerHr: number
    helperCostPerHr: number
    qualityInspectorCostPerHr: number
    productionSupervisorCostPerHr: number
    qualitySupervisorCostPerHr: number
    engineerCostPerHr: number
    adminCostPerHr: number
  }
  calculationData?: {
    investmentCost: number
    spaceCost: number
    powerCost: number
    consumablesCost: number
    toolCost: number
    wages: number
    salary: number
    otherOverheads: number
    profit: number
    machineHourRate: number
  }
  createdAt?: any
  updatedAt?: any
}

const COLLECTION_NAME = "machines"

// Mock data for when Firebase is not available
const mockMachines: MachineData[] = [
  {
    id: "mock-1",
    machineName: "CNC Lathe Machine",
    investmentData: {
      machineCost: 1500000,
      lifeOfMachine: 10,
      workingHoursPerDay: 8,
      balanceLifeOfMachine: 8,
      interestRate: 12,
      scrapRate: 10,
      machineLifeHours: 29200,
      currentValueOfMachine: 1200000,
    },
    spaceData: {
      factoryRentPerMonth: 50000,
      factorySpaceInSqFt: 5000,
      spaceOccupiedByMachine: 100,
      numberOfMachinesInFactory: 10,
      commonSpaceInSqFt: 1000,
    },
    powerData: {
      machinePower: 15,
      effectiveRunningTimeOfMotors: 80,
      powerOfFan: 75,
      powerOfLight: 40,
      numberOfFansAroundMachine: 2,
      numberOfLightsAroundMachine: 4,
      compressorPower: 7.5,
      numberOfMachinesConnectedWithCompressor: 5,
      effectiveRunningTimeOfCompressor: 60,
      powerOfOtherElectricalEquipment: 500,
      utilization: 85,
      ebUnitRate: 7.5,
      dieselConsumptionByGenset: 3.5,
      dieselCostPerLitre: 85,
      gensetPower: 100,
      gensetUnitRate: 2.975,
      electricityUnitRate: 8.5,
    },
    consumablesData: {
      coolantOilTopUpPerMonth: 20,
      coolantOilCostPerLitre: 150,
      wasteUsagePerMonth: 50,
      costOfWastePerKg: 25,
      monthlyMaintenanceCost: 5000,
      annualMaintenanceCost: 25000,
      otherConsumablesPerMonth: 2000,
    },
    toolsWagesData: {
      averageToolCostPerMonth: 8000,
      operatorSalaryPerMonth: 25000,
      helperSalaryPerMonth: 18000,
      qualityInspectorSalaryPerMonth: 22000,
    },
    overheadsData: {
      productionSupervisorSalaryPerMonth: 45000,
      qualitySupervisorSalaryPerMonth: 40000,
      engineerSalaryPerMonth: 50000,
      managerSalaryPerMonth: 75000,
      adminStaffSalaryPerMonth: 30000,
      noOfMachinesHandledByOperator: 1,
      noOfMachinesHandledByHelper: 2,
      noOfMachinesHandledByQualityInspector: 3,
      noOfMachinesHandledByProductionSupervisor: 10,
      noOfMachinesHandledByQualitySupervisor: 15,
      noOfMachinesHandledByEngineer: 20,
    },
    calculationData: {
      investmentCost: 45.5,
      spaceCost: 12.3,
      powerCost: 18.7,
      consumablesCost: 25.4,
      toolCost: 15.2,
      wages: 35.8,
      salary: 22.1,
      otherOverheads: 0,
      profit: 10,
      machineHourRate: 192.5,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-2",
    machineName: "Milling Machine",
    investmentData: {
      machineCost: 800000,
      lifeOfMachine: 8,
      workingHoursPerDay: 8,
      balanceLifeOfMachine: 6,
      interestRate: 10,
      scrapRate: 8,
      machineLifeHours: 23360,
      currentValueOfMachine: 600000,
    },
    spaceData: {
      factoryRentPerMonth: 50000,
      factorySpaceInSqFt: 5000,
      spaceOccupiedByMachine: 80,
      numberOfMachinesInFactory: 10,
      commonSpaceInSqFt: 1000,
    },
    powerData: {
      machinePower: 12,
      effectiveRunningTimeOfMotors: 75,
      powerOfFan: 75,
      powerOfLight: 40,
      numberOfFansAroundMachine: 2,
      numberOfLightsAroundMachine: 3,
      compressorPower: 7.5,
      numberOfMachinesConnectedWithCompressor: 5,
      effectiveRunningTimeOfCompressor: 60,
      powerOfOtherElectricalEquipment: 300,
      utilization: 80,
      ebUnitRate: 7.5,
      dieselConsumptionByGenset: 3.5,
      dieselCostPerLitre: 85,
      gensetPower: 100,
      gensetUnitRate: 2.975,
      electricityUnitRate: 8.5,
    },
    consumablesData: {
      coolantOilTopUpPerMonth: 15,
      coolantOilCostPerLitre: 150,
      wasteUsagePerMonth: 30,
      costOfWastePerKg: 25,
      monthlyMaintenanceCost: 3000,
      annualMaintenanceCost: 15000,
      otherConsumablesPerMonth: 1500,
    },
    toolsWagesData: {
      averageToolCostPerMonth: 6000,
      operatorSalaryPerMonth: 23000,
      helperSalaryPerMonth: 16000,
      qualityInspectorSalaryPerMonth: 20000,
    },
    overheadsData: {
      productionSupervisorSalaryPerMonth: 45000,
      qualitySupervisorSalaryPerMonth: 40000,
      engineerSalaryPerMonth: 50000,
      managerSalaryPerMonth: 75000,
      adminStaffSalaryPerMonth: 30000,
      noOfMachinesHandledByOperator: 1,
      noOfMachinesHandledByHelper: 2,
      noOfMachinesHandledByQualityInspector: 3,
      noOfMachinesHandledByProductionSupervisor: 10,
      noOfMachinesHandledByQualitySupervisor: 15,
      noOfMachinesHandledByEngineer: 20,
    },
    calculationData: {
      investmentCost: 32.1,
      spaceCost: 9.8,
      powerCost: 14.2,
      consumablesCost: 18.6,
      toolCost: 11.5,
      wages: 32.1,
      salary: 20.5,
      otherOverheads: 0,
      profit: 15,
      machineHourRate: 160.9,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Check if Firebase is available
const isFirebaseAvailable = () => {
  return db !== null
}

export const saveMachine = async (machineData: MachineData): Promise<string> => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase not available, using local storage")
      // Fallback to localStorage
      const machines = JSON.parse(localStorage.getItem("savedMachines") || "[]")
      const id = machineData.id || `local-${Date.now()}`
      const updatedMachine = { ...machineData, id, updatedAt: new Date() }

      if (machineData.id) {
        const index = machines.findIndex((m: MachineData) => m.id === machineData.id)
        if (index >= 0) {
          machines[index] = updatedMachine
        } else {
          machines.push(updatedMachine)
        }
      } else {
        updatedMachine.createdAt = new Date()
        machines.push(updatedMachine)
      }

      localStorage.setItem("savedMachines", JSON.stringify(machines))
      return id
    }

    if (machineData.id) {
      // Update existing machine
      const machineRef = doc(db, COLLECTION_NAME, machineData.id)
      await updateDoc(machineRef, {
        ...machineData,
        updatedAt: serverTimestamp(),
      })
      return machineData.id
    } else {
      // Create new machine
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...machineData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    }
  } catch (error) {
    console.error("Error saving machine:", error)
    // Fallback to localStorage on error
    const machines = JSON.parse(localStorage.getItem("savedMachines") || "[]")
    const id = machineData.id || `local-${Date.now()}`
    const updatedMachine = { ...machineData, id, updatedAt: new Date() }

    if (machineData.id) {
      const index = machines.findIndex((m: MachineData) => m.id === machineData.id)
      if (index >= 0) {
        machines[index] = updatedMachine
      } else {
        machines.push(updatedMachine)
      }
    } else {
      updatedMachine.createdAt = new Date()
      machines.push(updatedMachine)
    }

    localStorage.setItem("savedMachines", JSON.stringify(machines))
    return id
  }
}

export const getMachine = async (id: string): Promise<MachineData | null> => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase not available, using local storage")
      const machines = JSON.parse(localStorage.getItem("savedMachines") || "[]")
      return machines.find((m: MachineData) => m.id === id) || null
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as MachineData
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting machine:", error)
    // Fallback to localStorage
    const machines = JSON.parse(localStorage.getItem("savedMachines") || "[]")
    return machines.find((m: MachineData) => m.id === id) || null
  }
}

export const getAllMachines = async (): Promise<MachineData[]> => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase not available, using mock data and local storage")
      const localMachines = JSON.parse(localStorage.getItem("savedMachines") || "[]")
      return [...mockMachines, ...localMachines]
    }

    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
    const machines: MachineData[] = []

    querySnapshot.forEach((doc) => {
      machines.push({ id: doc.id, ...doc.data() } as MachineData)
    })

    return machines
  } catch (error) {
    console.error("Error getting machines:", error)
    // Fallback to mock data and localStorage
    const localMachines = JSON.parse(localStorage.getItem("savedMachines") || "[]")
    return [...mockMachines, ...localMachines]
  }
}

export const deleteMachine = async (id: string): Promise<void> => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase not available, using local storage")
      const machines = JSON.parse(localStorage.getItem("savedMachines") || "[]")
      const filteredMachines = machines.filter((m: MachineData) => m.id !== id)
      localStorage.setItem("savedMachines", JSON.stringify(filteredMachines))
      return
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id))
  } catch (error) {
    console.error("Error deleting machine:", error)
    // Fallback to localStorage
    const machines = JSON.parse(localStorage.getItem("savedMachines") || "[]")
    const filteredMachines = machines.filter((m: MachineData) => m.id !== id)
    localStorage.setItem("savedMachines", JSON.stringify(filteredMachines))
  }
}
