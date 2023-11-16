import torch.nn as nn


class NeuraNet(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(NeuraNet, self).__init__()
        self.L1 = nn.Linear(input_size, hidden_size)
        self.L2 = nn.Linear(hidden_size, hidden_size)
        self.L3 = nn.Linear(hidden_size, num_classes)
        self.relu = nn.ReLU()

    def forward(self, x):
        out = self.L1(x)
        out = self.relu(out)
        out = self.L2(out)
        out = self.relu(out)
        out = self.L3(out)
        # no activation and no softmax
        return out
