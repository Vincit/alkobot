import Holidays from "date-holidays";
import fetchAlkoData from "./fetchAlkoData";

const holidays = new Holidays('FI');
const REFERENCE_IDS = ['2102', '2196', '2198', '2161'];

export default async () => {
  try {
    const data = await fetchAlkoData();
    const referenceStores = data.stores.filter(store => REFERENCE_IDS.includes(store.storeId));
    if (!referenceStores.length) throw new Error('No reference stores found');
    const response = {
      isActualData: true,
      today: referenceStores.every((store) => store.OpenDay0 === '0'),
      tomorrow: referenceStores.every((store) => store.OpenDay1 === '0'),
    };
    return response;
  } catch (e) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const today = new Date();
    const isClosedToday = today.getDay() === 0 || holidays.isHoliday(today);
    const isClosedTomorrow = tomorrow.getDay() === 0 || holidays.isHoliday(tomorrow);
    return {
      isActualData: false,
      today: isClosedToday,
      tomorrow: isClosedTomorrow,
    };
  }
};
