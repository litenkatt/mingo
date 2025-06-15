import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const { username } = request.body as { username: string };
    if (!username)
      return reply.status(400).send({ error: 'Username required' });

    // In real app: issue token or set session here
    return { success: true, username };
  });
}
