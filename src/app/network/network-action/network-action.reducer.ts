import * as moment from 'moment-mini-ts';

const initialState: any = {
    ids: [],
    idsFilter: [],
    entities: {},
    filter: {
        local: true,
        remote: true,
        connection: true,
        metadata: true,
        bootstrap: true,
        current_head: true,
        current_branch: true,
        block_headers: true,
        block_operatons: true,
    },
};

export function reducer(state = initialState, action) {
    switch (action.type) {

        case 'NETWORK_ACTION_LOAD_SUCCESS': {

            // console.log('[NETWORK_ACTION_LOAD_SUCCESS]', action );

            return {
                ...state,
                ids: action.payload
                    .map(networkAction => networkAction.id),
                idsFilter: action.payload
                    .filter(entity => networkActionSourceFilter(entity, state.filter) )
                    .map(networkAction => networkAction.id),
                entities: action.payload
                    .reduce((accumulator, networkAction) => {

                        if (networkAction.type === 'metadata') {

                            // console.log("[metadata]", networkAction);
                            const preview = JSON.stringify(networkAction.message);

                            return {
                                ...accumulator,
                                [networkAction.id]: {
                                    ...networkAction,
                                    category: 'Meta',
                                    kind: '',
                                    payload: networkAction.message,
                                    preview: preview.length > 20 ? preview.substring(0, 20) + '...' : '',
                                    datetime: moment.utc(Math.ceil(networkAction.timestamp / 1000000)).format('HH:mm:ss.SSS, DD MMM YY'),
                                }
                            };
                        }

                        if (networkAction.type === 'connection_message') {

                            // console.log("[connection_message]", networkAction);
                            const preview = JSON.stringify(networkAction.message);

                            return {
                                ...accumulator,
                                [networkAction.id]: {
                                    ...networkAction,
                                    category: 'Connection',
                                    kind: '',
                                    payload: networkAction.message,
                                    preview: preview.length > 20 ? preview.substring(0, 20) + '...' : '',
                                    datetime: moment.utc(Math.ceil(networkAction.timestamp / 1000000)).format('HH:mm:ss.SSS, DD MMM YY'),
                                }
                            };
                        }

                        if (networkAction.type === 'p2p_message') {

                            // console.log("[p2p_message]", networkAction);

                            const payload = { ...networkAction.message[0] };
                            delete payload.type;
                            const preview = JSON.stringify(payload);
                            return {
                                ...accumulator,
                                [networkAction.id]: {
                                    ...networkAction,
                                    category: 'P2P',
                                    kind: networkAction.message[0].type,
                                    payload: payload,
                                    preview: preview.length > 20 ? preview.substring(0, 20) + '...' : '',
                                    datetime: moment.utc(Math.ceil(networkAction.timestamp / 1000000)).format('HH:mm:ss.SSS, DD MMM YY'),
                                }
                            };
                        }

                        // console.log("[default]", networkAction);

                        return {
                            ...accumulator,
                            [networkAction.id]: {
                                ...networkAction,
                                payload: networkAction.message,
                                datetime: moment.utc(Math.ceil(networkAction.timestamp / 1000000)).format('HH:mm:ss.SSS, DD MMM YY'),

                            }
                        };

                    }, {}),
            };
        }

        // filter network items according to traffic source
        case 'NETWORK_ACTION_FILTER': {

            const stateFilter = {
                ...state.filter,
                [action.payload]: state.filter[action.payload] ? false : true,
            };

            return {
                ...state,
                idsFilter: state.ids.filter(id => networkActionSourceFilter(state.entities[id], stateFilter)),
                filter: stateFilter,
            };
        }

        default:
            return state;
    }
}

// filter network items according to traffic source
export function networkActionSourceFilter(entity, filter) {

        if (filter.local && filter.remote) {
            return true;
        }

        // process all connection messages
        if (entity.type === 'connection_message' && filter.connection ) {

            if (filter.local && !entity.incoming) { return true; }
            if (filter.remote && entity.incoming) { return true; }

        }

        // process all meta messages
        if (entity.type === 'metadata' && filter.metadata ) {

            if (filter.local && !entity.incoming) { return true; }
            if (filter.remote && entity.incoming) { return true; }

        }

        // process all p2p messages
        if (entity.type === 'p2p_message') {

            if (filter.local) {

                if (filter.bootstrap && entity.kind === 'bootstrap' && !entity.incoming) { return true; }

                if (filter.current_head && entity.kind === 'get_current_head' && !entity.incoming) { return true; }
                if (filter.current_head && entity.kind === 'current_head' && entity.incoming) { return true; }

                if (filter.current_branch && entity.kind === 'get_current_branch' && !entity.incoming) { return true; }
                if (filter.current_branch && entity.kind === 'current_branch' && entity.incoming) { return true; }

                if (filter.block_headers && entity.kind === 'get_block_headers' && !entity.incoming) { return true; }
                if (filter.block_headers && entity.kind === 'block_header' && entity.incoming) { return true; }

                if (filter.block_operatons && entity.kind === 'get_operations_for_blocks' && !entity.incoming) { return true; }
                if (filter.block_operatons && entity.kind === 'operations_for_blocks' && entity.incoming) { return true; }

            }

            if (filter.remote) {

                if (filter.bootstrap && entity.kind === 'bootstrap' && entity.incoming) { return true; }

                if (filter.current_head &&  entity.kind === 'get_current_head' && entity.incoming) { return true; }
                if (filter.current_head &&  entity.kind === 'current_head' && !entity.incoming) { return true; }

                if (filter.current_branch && entity.kind === 'get_current_branch' && entity.incoming) { return true; }
                if (filter.current_branch && entity.kind === 'current_branch' && !entity.incoming) { return true; }

                if (filter.block_headers && entity.kind === 'get_block_headers' && entity.incoming) { return true; }
                if (filter.block_headers && entity.kind === 'block_header' && !entity.incoming) { return true; }

                if (filter.block_operatons && entity.kind === 'get_operations_for_blocks' && entity.incoming) { return true; }
                if (filter.block_operatons && entity.kind === 'operations_for_blocks' && !entity.incoming) { return true; }

            }

        }

        return false;
}