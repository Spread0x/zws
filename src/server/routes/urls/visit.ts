import {FastifyInstance, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault, RouteOptions} from 'fastify';
import S from 'fluent-json-schema';
import {urls} from '../../../services';
import {UrlNotFound} from '../../errors';

export default function declareRoute(fastify: FastifyInstance) {
	const route: RouteOptions<
		RawServerDefault,
		RawRequestDefaultExpression,
		RawReplyDefaultExpression,
		{Params: {short: string}; Querystring: {visit: boolean}; Reply: {url: string}}
	> = {
		method: 'GET',
		url: '/:short',
		schema: {
			params: S.object().prop('short', S.string()),
			querystring: S.object().prop('visit', S.boolean().default(true))
		},
		handler: async (request, reply) => {
			const {
				query: {visit},
				params: {short}
			} = request;

			if (short === '') {
				reply.callNotFound();
				return;
			}

			const url = await urls.visit(urls.normalizeShortId(short), true);

			if (url === null) {
				throw new UrlNotFound();
			}

			if (visit) {
				void reply.redirect(301, url);
			} else {
				return {url};
			}
		}
	};

	fastify.route(route);
}
