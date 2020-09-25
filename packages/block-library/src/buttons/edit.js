/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	__experimentalAlignmentHookSettingsProvider as AlignmentHookSettingsProvider,
	BlockControls,
	InnerBlocks,
	__experimentalUseBlockWrapperProps as useBlockWrapperProps,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarItem } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { name as buttonBlockName } from '../button';
import ContentJustificationDropdown from './content-justification-dropdown';

const ALLOWED_BLOCKS = [ buttonBlockName ];
const BUTTONS_TEMPLATE = [ [ 'core/button' ] ];

// Inside buttons block alignment options are not supported.
const alignmentHooksSetting = {
	isEmbedButton: true,
};

function ButtonsEdit( {
	attributes: { contentJustification },
	setAttributes,
} ) {
	const blockWrapperProps = useBlockWrapperProps( {
		className: classnames( {
			[ `is-content-justification-${ contentJustification }` ]: contentJustification,
		} ),
	} );
	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarItem>
						{ ( toggleProps ) => (
							<ContentJustificationDropdown
								toggleProps={ toggleProps }
								value={ contentJustification }
								onChange={ ( updatedValue ) => {
									setAttributes( {
										contentJustification: updatedValue,
									} );
								} }
							/>
						) }
					</ToolbarItem>
				</ToolbarGroup>
			</BlockControls>
			<AlignmentHookSettingsProvider value={ alignmentHooksSetting }>
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					__experimentalPassedProps={ blockWrapperProps }
					__experimentalTagName="div"
					template={ BUTTONS_TEMPLATE }
					orientation="horizontal"
				/>
			</AlignmentHookSettingsProvider>
		</>
	);
}

export default ButtonsEdit;
