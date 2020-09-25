/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default function save( {
	attributes: { contentJustification },
	className,
} ) {
	return (
		<div
			className={ classnames( className, {
				[ `is-content-justification-${ contentJustification }` ]: contentJustification,
			} ) }
		>
			<InnerBlocks.Content />
		</div>
	);
}
