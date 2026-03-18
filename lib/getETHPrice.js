export const getETHPrice = async () => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ETH price: ${response.status}`);
    }

    const data = await response.json();
    const ethPrice = data?.[0]?.current_price;

    if (!ethPrice) {
      return null;
    }

    return parseFloat(Number(ethPrice).toFixed(2));
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getWEIPriceInUSD = (usd, wei) => {
  if (!usd || !wei) {
    return "0.00";
  }

  return parseFloat(convertWeiToETH(wei) * usd).toFixed(2);
};

export const getETHPriceInUSD = (usd, eth) => {
  if (!usd || !eth) {
    return "0.00";
  }

  return parseFloat(eth * usd).toFixed(2);
};

export const convertWeiToETH = (wei) => {
  return parseFloat(wei) / 1000000000000000000;
};
