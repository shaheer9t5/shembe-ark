// South African provinces
export const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
] as const;

// Province translation helper
export const getTranslatedProvinces = (t: (key: string) => string) => {
  return SA_PROVINCES.map(province => ({
    value: province,
    label: t(`provinces.${province}`)
  }));
};

