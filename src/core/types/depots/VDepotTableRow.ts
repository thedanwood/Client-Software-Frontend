import { VAddress } from "../shared";

type VDepotTableRow = {
    id: number,
    name: string,
    address: VAddress,
    numberOfMaterialsSupplied: number
}

export default VDepotTableRow;