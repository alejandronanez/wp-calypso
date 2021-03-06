/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import get from 'lodash/get';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	NOTICE_CREATE,
	NOTICE_REMOVE,
	POST_SAVE_SUCCESS,
	ROUTE_SET
} from 'state/action-types';
import { createReducer } from 'state/utils';

export const items = createReducer( {}, {
	[ NOTICE_CREATE ]: ( state, action ) => {
		const { notice } = action;
		return {
			...state,
			[ notice.noticeId ]: notice
		};
	},
	[ NOTICE_REMOVE ]: ( state, action ) => {
		const { noticeId } = action;
		if ( ! state.hasOwnProperty( noticeId ) ) {
			return state;
		}

		return omit( state, noticeId );
	},
	[ ROUTE_SET ]: ( state ) => {
		return reduce( state, ( memo, notice, noticeId ) => {
			if ( ! notice.isPersistent && ! notice.displayOnNextPage ) {
				return memo;
			}

			let nextNotice = notice;
			if ( nextNotice.displayOnNextPage ) {
				nextNotice = {
					...nextNotice,
					displayOnNextPage: false
				};
			}

			memo[ noticeId ] = nextNotice;
			return memo;
		}, {} );
	},
	[ POST_SAVE_SUCCESS ]: ( state, action ) => {
		// Display a notice after a post save request has completed
		// succesfully (trashed, published, or otherwise updated)
		const noticeId = action.type;
		const count = get( state, [ noticeId, 'count' ], 0 ) + 1;

		let text;
		switch ( action.post.status ) {
			case 'trash':
				if ( 1 === count ) {
					text = translate( 'Post successfully moved to trash' );
				} else {
					text = translate(
						'%d post successfully moved to trash',
						'%d posts successfully moved to trash',
						{ count, args: [ count ] }
					);
				}
				break;

			case 'publish':
				if ( 1 === count ) {
					text = translate( 'Post successfully published' );
				} else {
					text = translate(
						'%d post successfully published',
						'%d posts successfully published',
						{ count, args: [ count ] }
					);
				}
				break;
		}

		if ( ! text ) {
			return state;
		}

		return {
			...state,
			[ noticeId ]: {
				showDismiss: true,
				isPersistent: false,
				displayOnNextPage: false,
				status: 'is-success',
				noticeId,
				count,
				text
			}
		};
	}
} );

export default combineReducers( {
	items
} );
