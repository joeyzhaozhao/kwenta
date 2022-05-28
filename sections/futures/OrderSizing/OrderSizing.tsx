import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import { Synths } from 'constants/currency';
import CustomInput from 'components/Input/CustomInput';
import { FlexDivRow } from 'styles/common';
import { tradeSizeState, tradeSizeSUSDState } from 'store/futures';
import { useRecoilValue } from 'recoil';

type OrderSizingProps = {
	disabled?: boolean;
	onAmountChange: (value: string) => void;
	onAmountSUSDChange: (value: string) => void;
	onLeverageChange: (value: string) => void;
	marketAsset: string | null;
	maxLeverage: Wei;
	totalMargin: Wei;
};

const OrderSizing: React.FC<OrderSizingProps> = ({
	marketAsset,
	disabled,
	onAmountChange,
	onAmountSUSDChange,
	onLeverageChange,
	maxLeverage,
	totalMargin,
}) => {
	const tradeSize = useRecoilValue(tradeSizeState);
	const tradeSizeSUSD = useRecoilValue(tradeSizeSUSDState);

	const handleSetMax = () => {
		const maxOrderSizeUSDValue = Number(maxLeverage.mul(totalMargin)).toFixed(0);
		onAmountSUSDChange(maxOrderSizeUSDValue);
		onLeverageChange(Number(maxLeverage).toString().substring(0, 4));
	};

	return (
		<OrderSizingContainer>
			<OrderSizingRow>
				<OrderSizingTitle>
					Amount&nbsp; —<span>&nbsp; Set order size</span>
				</OrderSizingTitle>
				<MaxButton onClick={handleSetMax}>Max</MaxButton>
			</OrderSizingRow>

			<CustomInput
				disabled={disabled}
				right={marketAsset || Synths.sUSD}
				value={tradeSize}
				placeholder="0.0"
				onChange={(_, v) => onAmountChange(v)}
				style={{
					marginBottom: '-1px',
					borderBottom: 'none',
					borderBottomRightRadius: '0px',
					borderBottomLeftRadius: '0px',
				}}
			/>

			<CustomInput
				disabled={disabled}
				right={Synths.sUSD}
				value={tradeSizeSUSD}
				placeholder="0.0"
				onChange={(_, v) => onAmountSUSDChange(v)}
				style={{
					borderTopRightRadius: '0px',
					borderTopLeftRadius: '0px',
				}}
			/>
		</OrderSizingContainer>
	);
};

const OrderSizingContainer = styled.div`
	margin-top: 28px;
	margin-bottom: 16px;
`;

const OrderSizingTitle = styled.div`
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-size: 12px;

	span {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

const OrderSizingRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	margin-bottom: 8px;
	padding: 0 14px;
`;

const MaxButton = styled.button`
	text-decoration: underline;
	font-size: 11px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`;

export default OrderSizing;
