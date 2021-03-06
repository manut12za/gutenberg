/**
 * External dependencies
 */
import { invert } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { dispatch, select, getWidgetToClientIdMapping } from './controls';
import { transformBlockToWidget } from './transformers';
import {
	buildWidgetAreaPostId,
	buildWidgetAreasQuery,
	KIND,
	POST_TYPE,
	WIDGET_AREA_ENTITY_TYPE,
} from './utils';

export function* saveEditedWidgetAreas() {
	const editedWidgetAreas = yield select(
		'core/edit-widgets',
		'getEditedWidgetAreas'
	);
	if ( ! editedWidgetAreas?.length ) {
		return;
	}
	try {
		yield* saveWidgetAreas( editedWidgetAreas );
		yield dispatch(
			'core/notices',
			'createSuccessNotice',
			__( 'Widgets saved.' ),
			{
				type: 'snackbar',
			}
		);
	} catch ( e ) {
		yield dispatch(
			'core/notices',
			'createErrorNotice',
			__( 'There was an error.' ),
			{
				type: 'snackbar',
			}
		);
	}
}

export function* saveWidgetAreas( widgetAreas ) {
	try {
		const widgets = yield select( 'core/edit-widgets', 'getWidgets' );
		const widgetIdToClientId = yield getWidgetToClientIdMapping();
		const clientIdToWidgetId = invert( widgetIdToClientId );

		// @TODO: Batch save / concurrency
		for ( const widgetArea of widgetAreas ) {
			const post = yield select(
				'core',
				'getEditedEntityRecord',
				KIND,
				POST_TYPE,
				buildWidgetAreaPostId( widgetArea.id )
			);
			const widgetsBlocks = post.blocks;
			const newWidgets = widgetsBlocks.map( ( block ) => {
				const widgetId = clientIdToWidgetId[ block.clientId ];
				const oldWidget = widgets[ widgetId ];
				return transformBlockToWidget( block, oldWidget );
			} );

			yield dispatch(
				'core',
				'editEntityRecord',
				KIND,
				WIDGET_AREA_ENTITY_TYPE,
				widgetArea.id,
				{ widgets: newWidgets }
			);

			yield* trySaveWidgetArea( widgetArea.id );

			yield dispatch(
				'core',
				'receiveEntityRecords',
				KIND,
				POST_TYPE,
				post,
				undefined
			);
		}
	} finally {
		// saveEditedEntityRecord resets the resolution status, let's fix it manually
		yield dispatch(
			'core',
			'finishResolution',
			'getEntityRecord',
			KIND,
			WIDGET_AREA_ENTITY_TYPE,
			buildWidgetAreasQuery()
		);
	}
}

function* trySaveWidgetArea( widgetAreaId ) {
	const saveErrorBefore = yield select(
		'core',
		'getLastEntitySaveError',
		KIND,
		WIDGET_AREA_ENTITY_TYPE,
		widgetAreaId
	);
	yield dispatch(
		'core',
		'saveEditedEntityRecord',
		KIND,
		WIDGET_AREA_ENTITY_TYPE,
		widgetAreaId
	);
	const saveErrorAfter = yield select(
		'core',
		'getLastEntitySaveError',
		KIND,
		WIDGET_AREA_ENTITY_TYPE,
		widgetAreaId
	);
	if ( saveErrorAfter && saveErrorBefore !== saveErrorAfter ) {
		throw new Error( saveErrorAfter );
	}
}

/**
 * Sets the clientId stored for a particular widgetId.
 *
 * @param  {number} clientId  Client id.
 * @param  {number} widgetId  Widget id.
 * @return {Object}           Action.
 */
export function setWidgetIdForClientId( clientId, widgetId ) {
	return {
		type: 'SET_WIDGET_ID_FOR_CLIENT_ID',
		clientId,
		widgetId,
	};
}

/**
 * Sets the open state of all the widget areas.
 *
 * @param  {Object} widgetAreasOpenState The open states of all the widget areas.
 * @return {Object}                      Action.
 */
export function setWidgetAreasOpenState( widgetAreasOpenState ) {
	return {
		type: 'SET_WIDGET_AREAS_OPEN_STATE',
		widgetAreasOpenState,
	};
}

/**
 * Sets the open state of the widget area.
 *
 * @param  {string}  clientId   The clientId of the widget area.
 * @param  {boolean} isOpen     Whether the widget area should be opened.
 * @return {Object}             Action.
 */
export function setIsWidgetAreaOpen( clientId, isOpen ) {
	return {
		type: 'SET_IS_WIDGET_AREA_OPEN',
		clientId,
		isOpen,
	};
}
