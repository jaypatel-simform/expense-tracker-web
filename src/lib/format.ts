// Single currency for the MVP. Change here to switch.
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatMoney = (value: number | string) => currency.format(Number(value));

export const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

export const isoToDateInput = (iso: string) => iso.slice(0, 10);

export const currentMonthRange = () => {
  const now = new Date();
  return {
    from: toDateInput(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))),
    to: toDateInput(new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0))),
  };
};

export const today = () => {
  const now = new Date();
  return toDateInput(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
};
