export const createRepository = (model: any) => {
  return {
    create: (data: any) => model.create({ data }),

    findAll: () => model.findMany(),

    findById: (id: string) =>
      model.findUnique({ where: { id } }),

    update: (id: string, data: any) =>
      model.update({ where: { id }, data }),

    delete: (id: string) =>
      model.delete({ where: { id } }),
  };
};