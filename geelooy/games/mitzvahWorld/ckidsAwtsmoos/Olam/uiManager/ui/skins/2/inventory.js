//B"H

export default /*css*/`
	.awtsmoosInventoryViewer {
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		padding:10px;
		background: yellow;
		border:5px solid black;
		border-radius: 10px;
		display: flex;
		gap: 5px;
		flex-direction: column;
		
	}

	.awtsmoosInventoryViewer .header {
		display: flex;
		flex-direction: row;
		
		justify-content: space-between;
	}

	.awtsmoosInventoryViewer .header .close {
		display: flex;
		width: 25px;
		height: 25px;
		user-select: none;
		background: red;
		justify-content: center;
		align-items: center;
		border: 1px solid black;
		border-radius: 50%;
	}

	.awtsmoosInventoryViewer .header 
	.close:hover {
		background: orange;
		cursor: pointer;
	}

	.awtsmoosInventoryViewer .slots {
		flex: 1;
		display: flex;
		max-height:80vh;
		overflow-y:scroll;
		gap: 5px;
		
		flex-wrap: wrap;
	}
`