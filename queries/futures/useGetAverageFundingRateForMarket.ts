import Wei, { wei } from '@synthetixio/wei';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { marketInfoState, marketKeyState } from 'store/futures';
import { isL2State, networkState } from 'store/wallet';
import logError from 'utils/logError';

import { FundingRateUpdate } from './types';
import { getFuturesEndpoint, calculateFundingRate } from './utils';

const useGetAverageFundingRateForMarket = (
	periodLength: number,
	options?: UseQueryOptions<any | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const marketKey = useRecoilValue(marketKeyState);
	const marketInfo = useRecoilValue(marketInfoState);
	const futuresEndpoint = getFuturesEndpoint(network);

	const price = marketInfo?.price;
	const currentFundingRate = marketInfo?.currentFundingRate;
	const marketAddress = marketInfo?.market;

	return useQuery<Wei | null>(
		QUERY_KEYS.Futures.FundingRate(network.id, marketKey || ''),
		async () => {
			if (!marketKey || !price || !marketInfo) return null;
			const minTimestamp = Math.floor(Date.now() / 1000) - periodLength;
			try {
				const response: { string: FundingRateUpdate[] } = await request(
					futuresEndpoint,
					gql`
						query fundingRateUpdates($market: String!, $minTimestamp: BigInt!) {
							# last before timestamp
							first: fundingRateUpdates(
								first: 1
								where: { market: $market, timestamp_lt: $minTimestamp }
								orderBy: sequenceLength
								orderDirection: desc
							) {
								timestamp
								funding
							}

							# first after timestamp
							next: fundingRateUpdates(
								first: 1
								where: { market: $market, timestamp_gt: $minTimestamp }
								orderBy: sequenceLength
								orderDirection: asc
							) {
								timestamp
								funding
							}

							# latest update
							latest: fundingRateUpdates(
								first: 1
								where: { market: $market }
								orderBy: sequenceLength
								orderDirection: desc
							) {
								timestamp
								funding
							}
						}
					`,
					{ market: marketAddress, minTimestamp: minTimestamp }
				);
				const responseFilt = Object.values(response)
					.filter((value: FundingRateUpdate[]) => value.length > 0)
					.map((entry: FundingRateUpdate[]): FundingRateUpdate => entry[0])
					.sort((a: FundingRateUpdate, b: FundingRateUpdate) => a.timestamp - b.timestamp);

				return responseFilt && !!currentFundingRate
					? calculateFundingRate(
							minTimestamp,
							periodLength,
							responseFilt,
							price,
							currentFundingRate
					  )
					: wei(0);
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!marketInfo && !!currentFundingRate,
			...options,
		}
	);
};

export default useGetAverageFundingRateForMarket;
