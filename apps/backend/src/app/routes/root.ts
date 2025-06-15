import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  // API endpoint
  fastify.get('/api', async function () {
    return { message: 'Hello API' };
  });
}
